import fs from 'node:fs/promises';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface Logger {
  log(entry: LogEntry): Promise<void>;
}

class ConsoleLogger implements Logger {
  async log(entry: LogEntry) {
    const time = entry.timestamp.toISOString();
    console.log(`[${time}] ${entry.level.toUpperCase()}: ${entry.message}`);
  }
}

class FileLogger implements Logger {
  constructor(private filePath: string) {}

  async log(entry: LogEntry) {
    const line = JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
    }) + '\n';

    await fs.appendFile(this.filePath, line);
  }
}

class DBLogger implements Logger {
  constructor(private table: string) {}

  async log(entry: LogEntry) {
    console.log(`[DB] would insert into "${this.table}":`, {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
    });
  }
}

function createLogger(type: string): Logger {
  switch (type) {
    case 'console':
      return new ConsoleLogger();
    case 'file':
      return new FileLogger(process.env.LOG_FILE ?? './app.log');
    case 'database':
      return new DBLogger(process.env.LOG_TABLE ?? 'logs');
    default:
      throw new Error(`Unknown logger type: ${type}`);
  }
}

const logger = createLogger(process.env.LOG_TARGET ?? 'console');

await logger.log({ timestamp: new Date(), level: 'info', message: 'Service started' });
await logger.log({ timestamp: new Date(), level: 'warn', message: 'Ping missed for job cron_abc' });
await logger.log({ timestamp: new Date(), level: 'error', message: 'Failed to reach Telegram API' });