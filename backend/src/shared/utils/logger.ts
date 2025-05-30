import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Base format without colors for file logging
const fileFormat = combine(
  timestamp(),
  format.uncolorize(),
  logFormat
);

// Console format with colors for terminal output
const consoleFormat = combine(
  timestamp(),
  colorize(),
  logFormat
);

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  exitOnError: false,
  transports: [
    new transports.Console({
      format: consoleFormat
    }),
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxFiles: 5,
      maxsize: 5242880, // 5MB
      format: fileFormat
    }),
    new transports.File({ 
      filename: 'logs/combined.log',
      maxFiles: 5,
      maxsize: 5242880, // 5MB
      format: fileFormat
    })
  ]
});
