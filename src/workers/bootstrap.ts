/**
 * Worker Bootstrap
 * Initializes all background job processors
 * Run with: npm run jobs
 */

import { logger } from '@/lib/logger';

/**
 * Bootstrap all workers
 */
async function bootstrap(): Promise<void> {
  console.log('🚀 Starting Background Job Workers...\n');

  try {
    // Import and initialize email worker
    logger.info('Initializing email worker...');
    const { emailWorker, emailQueue, getEmailQueueStatus } = await import('@/jobs/email.worker');

    // Log queue status periodically
    const statusInterval = setInterval(async () => {
      const status = await getEmailQueueStatus();
      logger.info('Email queue status', status);
    }, 60000); // Every 60 seconds

    // Email worker is initialized on import

    // Handle graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n📛 Received ${signal}, shutting down gracefully...\n`);
        clearInterval(statusInterval);

        try {
          logger.info('Closing email worker...');
          await emailWorker.close();
          await emailQueue.close();
          logger.info('✅ Email worker closed');

          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });
    }

    // Log startup success
    console.log('✅ All workers initialized successfully\n');
    console.log('📧 Email Worker: RUNNING');
    console.log('   - Processing emails from queue');
    console.log('   - Concurrency: 5 parallel');
    console.log('   - Retries: 3 attempts with exponential backoff\n');

    console.log('📊 Queue Status:');
    const initialStatus = await getEmailQueueStatus();
    console.log(`   - Waiting: ${initialStatus.waiting}`);
    console.log(`   - Active: ${initialStatus.active}`);
    console.log(`   - Completed: ${initialStatus.completed}`);
    console.log(`   - Failed: ${initialStatus.failed}\n`);

    console.log('💡 To send a test email:');
    console.log('   import { queueEmail } from "@/jobs/email.worker";\n');

    logger.info('🎉 All workers ready. Listening for jobs...');
  } catch (error) {
    logger.error('Failed to initialize workers', error);
    process.exit(1);
  }
}

// Run bootstrap
bootstrap().catch((error) => {
  console.error('Fatal error in worker bootstrap:', error);
  process.exit(1);
});
