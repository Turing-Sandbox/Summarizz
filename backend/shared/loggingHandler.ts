import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

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

const loggingFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
})

const consoleTransport = new winston.transports.Console({
    format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        loggingFormat
    )
})

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    levels: levels,
    format: loggingFormat,
    transports: [
        consoleTransport
    ],
    exitOnError: false
});

const stream = {
    write: (message: string) => {
        logger.http(message.trim())
    }
}

export { logger, stream };
