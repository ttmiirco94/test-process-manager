const { createLogger, format, transports } = require('winston');
const path = require("path");

const logDir = path.join(__dirname, '..', '..');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'general' },
    transports: [
        new transports.File({ dirname: logDir,filename: 'error.log', level: 'error' }),
        new transports.File({ dirname: logDir, filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

module.exports = logger;

const createCustomLogger = (serviceName) => {
    const { createLogger, format, transports } = require('winston');

    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        ),
        defaultMeta: { from: serviceName/*, customParam: customParam*/ },
        transports: [
            new transports.File({ dirname: logDir, filename: 'error.log', level: 'error' }),
            new transports.File({ dirname: logDir, filename: 'combined.log' }),
        ],
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }));
    }

    return logger;
};

module.exports = createCustomLogger;