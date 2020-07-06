const os = require('os')
const path = require('path')
const winston = require('winston')

const hostname = os.hostname()

const timestampFormat = { 'format': 'YYYY-MM-DD HH:mm:ss' }

const logfileFormat = winston.format.printf(({level, message, timestamp}) => {
    return `${timestamp} ${hostname} [${level}] ${message}`
})

const consoleFormat = winston.format.printf(({level, message}) => {
    return `[${level}] ${message}`
})

if (process.env.NODE_ENV === 'production') {
    var log_file = path.join('/', 'var', 'log', 'do-dyndns.log')
    if (process.env.LOG_PATH) {
        log_file = process.env.LOG_PATH
    }

    console.log(`writing logs to ${log_file}`)

    module.exports = winston.createLogger({
        level: 'info',
        transports: [
            new winston.transports.File({
                'filename': log_file,
                'format': winston.format.combine(
                    winston.format.timestamp(timestampFormat),
                    logfileFormat,
                ),
            })
        ]
    })
} else {
    module.exports = winston.createLogger({
        level: 'debug',
        transports: [
            new winston.transports.Console({
                'format': winston.format.combine(
                    consoleFormat,
                ),
            })
        ]
    })
}
