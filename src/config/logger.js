const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    defaultMeta: { service: 'hotel-booking-api' },

    transports: [
        // Error logs - with daily rotation
        new DailyRotateFile({
            filename: 'src/logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxDays: '14d',
            tailable: true
        }),

        // Combined logs - with daily rotation
        new DailyRotateFile({
            filename: 'src/logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxDays: '14d',
            tailable: true
        })
    ]
});

// Console output only in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    );
}

module.exports = logger;