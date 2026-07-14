/**
 * Email Queue Worker - Processes email jobs from BullMQ queue
 * Handles retries, failures, and audit logging
 */

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { emailService, logEmailInAudit } from '@/services/email.service';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export interface EmailJob {
  userId: string;
  recipient: string;
  subject: string;
  html: string;
  type: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  retryCount?: number;
}

// Redis connection for queue
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

// Create email queue
export const emailQueue = new Queue<EmailJob>('email', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/**
 * Email queue worker - processes jobs
 */
export const emailWorker = new Worker<EmailJob>(
  'email',
  async (job: Job<EmailJob>) => {
    try {
      logger.info('Processing email job', {
        jobId: job.id,
        recipient: job.data.recipient,
        subject: job.data.subject,
        attempt: job.attemptsMade + 1,
      });

      const result = await emailService.sendEmail({
        to: job.data.recipient,
        subject: job.data.subject,
        html: job.data.html,
        cc: job.data.cc,
        bcc: job.data.bcc,
        attachments: job.data.attachments,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Log successful send to audit trail
      await logEmailInAudit(
        job.data.userId,
        job.data.recipient,
        job.data.subject,
        job.data.type,
        result
      );

      // Store email record in database
      try {
        await prisma.notification.create({
          data: {
            userId: job.data.userId,
            title: job.data.subject,
            message: `Email sent to ${job.data.recipient}`,
            type: 'EMAIL',
            metadata: JSON.stringify({
              messageId: result.messageId,
              recipient: job.data.recipient,
              emailType: job.data.type,
            }),
          },
        });
      } catch (error) {
        logger.error('Failed to create notification record', error);
      }

      logger.info('Email job completed successfully', {
        jobId: job.id,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('Email job failed', {
        jobId: job.id,
        recipient: job.data.recipient,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt: job.attemptsMade + 1,
      });

      // On final failure, log to audit trail
      if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
        try {
          await logEmailInAudit(
            job.data.userId,
            job.data.recipient,
            job.data.subject,
            job.data.type,
            {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
            }
          );

          // Create failed notification record
          await prisma.notification.create({
            data: {
              userId: job.data.userId,
              title: `Email failed: ${job.data.subject}`,
              message: `Failed to send email to ${job.data.recipient} after ${job.attemptsMade + 1} attempts`,
              type: 'ERROR',
              metadata: JSON.stringify({
                recipient: job.data.recipient,
                emailType: job.data.type,
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            },
          });
        } catch (auditError) {
          logger.error('Failed to log email failure', auditError);
        }
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 emails in parallel
  }
);

/**
 * Queue event handlers
 */
emailQueue.on('error', (error) => {
  logger.error('Email queue error', error);
});

emailWorker.on('failed', (job, error) => {
  logger.warn('Email job failed permanently', {
    jobId: job?.id,
    error: error.message,
  });
});

emailWorker.on('completed', (job) => {
  logger.info('Email job completed', { jobId: job.id });
});

/**
 * Helper function to queue an email
 */
export async function queueEmail(emailJob: EmailJob): Promise<string | undefined> {
  try {
    const job = await emailQueue.add(emailJob, {
      jobId: `email-${emailJob.userId}-${Date.now()}`,
    });

    logger.info('Email queued successfully', {
      jobId: job.id,
      recipient: emailJob.recipient,
      type: emailJob.type,
    });

    return job.id;
  } catch (error) {
    logger.error('Failed to queue email', {
      recipient: emailJob.recipient,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Helper function to queue multiple emails
 */
export async function queueEmailBatch(
  emailJobs: EmailJob[]
): Promise<string[]> {
  try {
    const jobs = await Promise.all(
      emailJobs.map((emailJob) => queueEmail(emailJob))
    );

    logger.info('Email batch queued', { count: jobs.length });

    return jobs.filter((id): id is string => id !== undefined);
  } catch (error) {
    logger.error('Failed to queue email batch', {
      count: emailJobs.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Get queue status
 */
export async function getEmailQueueStatus() {
  return {
    waiting: await emailQueue.count(),
    active: await emailQueue.getActiveCount(),
    delayed: await emailQueue.getDelayedCount(),
    failed: await emailQueue.getFailedCount(),
    completed: await emailQueue.getCompletedCount(),
  };
}

/**
 * Graceful shutdown
 */
export async function closeEmailWorker(): Promise<void> {
  await emailWorker.close();
  await emailQueue.close();
  await redisConnection.quit();
  logger.info('Email worker closed gracefully');
}
