import winston from "winston";
const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "white",
};

winston.addColors(colors);

// Custom format for console logging (Console-Only)
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 
        ? `\n${JSON.stringify(meta, null, 2)}` 
        : '';
    
    return `${timestamp} [${level}]: ${message}${metaStr}`;
});

// 1- Development Environment Logger (Console-Only)
const developmentLogger = () => {
    return winston.createLogger({
        level: 'debug',
        levels,
        format: combine(
            errors({ stack: true }),
            splat(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
            consoleFormat
        ),
        transports: [
            new winston.transports.Console({
                format: combine(
                    colorize({ all: true }),
                    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
                    consoleFormat
                )
            })
        ],
        exitOnError: false
    });
};

// 2- Production Environment Logger (Console-Only)
const productionLogger = () => {
    return winston.createLogger({
        level: 'info',
        levels,
        format: combine(
            errors({ stack: false }),
            splat(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
        ),
        transports: [
            new winston.transports.Console({
                format: combine(
                    colorize({ all: true }),
                    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                    printf(({ level, message, timestamp }) => {
                        return `${timestamp} [${level}]: ${message}`;
                    })
                )
            })
        ],
        exitOnError: false
    });
};

// Switch between appropriate logger based on NODE_ENV
const logger = process.env.NODE_ENV === 'production'
    ? productionLogger()
    : developmentLogger();

// Stream for use with Morgan HTTP logger middleware: https://expressjs.com/en/resources/middleware/morgan.html
const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    }
};

const getLoggerWithContext = (context: string) => {
    return {
        error: (message: string, meta = {}) => logger.error(`[${context}] ${message}`, meta),
        warn: (message: string, meta = {}) => logger.warn(`[${context}] ${message}`, meta),
        info: (message: string, meta = {}) => logger.info(`[${context}] ${message}`, meta),
        http: (message: string, meta = {}) => logger.http(`[${context}] ${message}`, meta),
        verbose: (message: string, meta = {}) => logger.verbose(`[${context}] ${message}`, meta),
        debug: (message: string, meta = {}) => logger.debug(`[${context}] ${message}`, meta),
    };
};

export { logger, stream, getLoggerWithContext };
