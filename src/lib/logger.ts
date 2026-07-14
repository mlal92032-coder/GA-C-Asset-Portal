/**
 * Centralized logging utility for the application
 * Provides structured logging with levels: debug, info, warn, error
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logHistory: LogEntry[] = []
  private maxHistorySize = 1000

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : ''
    return `${prefix} ${message}${metadataStr}`
  }

  private storeLog(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    }

    this.logHistory.push(entry)
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, metadata))
    }
    this.storeLog('debug', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>) {
    console.log(this.formatMessage('info', message, metadata))
    this.storeLog('info', message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    console.warn(this.formatMessage('warn', message, metadata))
    this.storeLog('warn', message, metadata)
  }

  error(message: string, metadata?: Record<string, any>) {
    console.error(this.formatMessage('error', message, metadata))
    this.storeLog('error', message, metadata)
  }

  getHistory(level?: LogLevel, limit: number = 100): LogEntry[] {
    let history = this.logHistory
    if (level) {
      history = history.filter(entry => entry.level === level)
    }
    return history.slice(-limit)
  }

  clearHistory() {
    this.logHistory = []
  }
}

export const logger = new Logger()
