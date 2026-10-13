import { Queue, Worker, QueueScheduler } from 'bullmq'
import { getRedisClient } from '@/lib/redis'
import { logger } from '@/lib/logger'

// ============= FEATURE FLAGS =============
const JOBS_ENABLED = process.env.ENABLE_BACKGROUND_JOBS === 'true'
const EMAIL_QUEUE_ENABLED = process.env.ENABLE_EMAIL_QUEUE === 'true' && JOBS_ENABLED

logger.info(`Background Jobs: ${JOBS_ENABLED ? '✅ ENABLED' : '❌ DISABLED (Vercel mode)'}`)
logger.info(`Email Queue: ${EMAIL_QUEUE_ENABLED ? '✅ ENABLED' : '❌ DISABLED (Fallback mode)'}`)

// Queue instances
let emailQueue: Queue | null = null
let smsQueue: Queue | null = null
let slackQueue: Queue | null = null
let reportQueue: Queue | null = null
let notificationQueue: Queue | null = null
let bulkOperationQueue: Queue | null = null

const connection = { host: 'localhost', port: 6379, ...parseRedisUrl() }

/**
 * Parse Redis URL to connection options
 */
function parseRedisUrl(): Record<string, any> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  if (redisUrl.startsWith('redis://')) {
    const url = new URL(redisUrl)
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '6379'),
      password: url.password || undefined,
      db: url.pathname ? parseInt(url.pathname.slice(1)) : 0,
    }
  }

  return { host: 'localhost', port: 6379 }
}

/**
 * Get email queue
 */
export function getEmailQueue(): Queue {
  if (!emailQueue) {
    emailQueue = new Queue('emails', { connection })

    emailQueue.on('error', (err) => {
      logger.error('Email queue error', { error: err.message })
    })

    logger.info('Email queue initialized')
  }

  return emailQueue
}

/**
 * Get SMS queue
 */
export function getSmsQueue(): Queue {
  if (!smsQueue) {
    smsQueue = new Queue('sms', { connection })

    smsQueue.on('error', (err) => {
      logger.error('SMS queue error', { error: err.message })
    })

    logger.info('SMS queue initialized')
  }

  return smsQueue
}

/**
 * Get Slack queue
 */
export function getSlackQueue(): Queue {
  if (!slackQueue) {
    slackQueue = new Queue('slack', { connection })

    slackQueue.on('error', (err) => {
      logger.error('Slack queue error', { error: err.message })
    })

    logger.info('Slack queue initialized')
  }

  return slackQueue
}

/**
 * Get report generation queue
 */
export function getReportQueue(): Queue {
  if (!reportQueue) {
    reportQueue = new Queue('reports', { connection })

    reportQueue.on('error', (err) => {
      logger.error('Report queue error', { error: err.message })
    })

    logger.info('Report queue initialized')
  }

  return reportQueue
}

/**
 * Get notification queue
 */
export function getNotificationQueue(): Queue {
  if (!notificationQueue) {
    notificationQueue = new Queue('notifications', { connection })

    notificationQueue.on('error', (err) => {
      logger.error('Notification queue error', { error: err.message })
    })

    logger.info('Notification queue initialized')
  }

  return notificationQueue
}

/**
 * Get bulk operation queue
 */
export function getBulkOperationQueue(): Queue {
  if (!bulkOperationQueue) {
    bulkOperationQueue = new Queue('bulk-operations', { connection })

    bulkOperationQueue.on('error', (err) => {
      logger.error('Bulk operation queue error', { error: err.message })
    })

    logger.info('Bulk operation queue initialized')
  }

  return bulkOperationQueue
}

/**
 * Add email job to queue
 * Falls back to synchronous sending if jobs are disabled (Vercel)
 */
export async function queueEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>,
  options?: { delay?: number; priority?: number },
) {
  // If background jobs disabled, log only (for Vercel)
  if (!JOBS_ENABLED) {
    logger.info(`[SYNC EMAIL] ${subject} to ${to}`, { template, data })
    return { id: `sync_${Date.now()}`, queued: false }
  }

  const queue = getEmailQueue()
  const job = await queue.add(
    'send-email',
    {
      to,
      subject,
      template,
      data,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    },
  )

  logger.info(`Email job queued: ${job.id} to ${to}`)
  return job
}

/**
 * Add SMS job to queue
 */
export async function queueSMS(
  phoneNumber: string,
  message: string,
  options?: { delay?: number; priority?: number },
) {
  const queue = getSmsQueue()
  const job = await queue.add(
    'send-sms',
    {
      phoneNumber,
      message,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    },
  )

  logger.info(`SMS job queued: ${job.id} to ${phoneNumber}`)
  return job
}

/**
 * Add Slack job to queue
 */
export async function queueSlackMessage(
  channel: string,
  message: any,
  options?: { delay?: number; priority?: number },
) {
  const queue = getSlackQueue()
  const job = await queue.add(
    'send-message',
    {
      channel,
      message,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    },
  )

  logger.info(`Slack job queued: ${job.id} to ${channel}`)
  return job
}

/**
 * Add report generation job
 */
export async function queueReport(
  reportType: string,
  userId: string,
  companyId: string,
  filters: Record<string, any>,
  options?: { delay?: number; priority?: number },
) {
  const queue = getReportQueue()
  const job = await queue.add(
    'generate-report',
    {
      reportType,
      userId,
      companyId,
      filters,
    },
    {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    },
  )

  logger.info(`Report job queued: ${job.id} (${reportType})`)
  return job
}

/**
 * Add bulk operation job
 */
export async function queueBulkOperation(
  operationType: string,
  operationId: string,
  userId: string,
  companyId: string,
  items: any[],
  options?: { delay?: number; priority?: number },
) {
  const queue = getBulkOperationQueue()
  const job = await queue.add(
    'process-bulk-operation',
    {
      operationType,
      operationId,
      userId,
      companyId,
      items,
    },
    {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    },
  )

  logger.info(`Bulk operation job queued: ${job.id} (${operationType})`)
  return job
}

/**
 * Get job status
 */
export async function getJobStatus(queue: Queue, jobId: string) {
  const job = await queue.getJob(jobId)
  if (!job) return null

  return {
    id: job.id,
    name: job.name,
    state: await job.getState(),
    progress: job.progress(),
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
  }
}

/**
 * Clean up old jobs
 */
export async function cleanupQueueJobs(queueName: string, maxAge: number = 86400000) {
  // maxAge in milliseconds (default: 24 hours)
  const queue = getQueueByName(queueName)
  if (queue) {
    await queue.clean(maxAge, 1000)
    logger.info(`Cleaned up old jobs in ${queueName} queue`)
  }
}

/**
 * Get queue by name
 */
function getQueueByName(name: string): Queue | null {
  switch (name) {
    case 'emails':
      return emailQueue
    case 'sms':
      return smsQueue
    case 'slack':
      return slackQueue
    case 'reports':
      return reportQueue
    case 'notifications':
      return notificationQueue
    case 'bulk-operations':
      return bulkOperationQueue
    default:
      return null
  }
}

/**
 * Gracefully close all queues
 */
export async function closeQueues() {
  const queues = [emailQueue, smsQueue, slackQueue, reportQueue, notificationQueue, bulkOperationQueue]

  for (const queue of queues) {
    if (queue) {
      await queue.close()
    }
  }

  logger.info('All job queues closed')
}
