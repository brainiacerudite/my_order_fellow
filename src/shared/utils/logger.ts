import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file";
import config from "../../config";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
}

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white"
}

winston.addColors(colors)

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

const transports = [
    new winston.transports.Console({ format }),

    // error logs
    new DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxFiles: "14d",
        maxSize: "20m",
        zippedArchive: true
    }),
    new DailyRotateFile({
        filename: "logs/combined-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
        maxSize: "20m",
        zippedArchive: true
    })
]

const level = () => {
    return config.server.isDevelopment ? 'debug' : config.logging.level
}

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports
})

export default logger