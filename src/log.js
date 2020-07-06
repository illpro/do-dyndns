const path = require('path')
const winston = require('winston')
const log_format = winston.format.simple()

if (process.env.NODE_ENV === 'production') {
    var log_file = path.join('/', 'var', 'log', 'do-dns.log')
    if (process.env.LOG_PATH) {
        log_file = process.env.LOG_PATH
    }

    console.log(`writing logs to ${log_file}`)

    module.exports = winston.createLogger({
        level: 'info',
        transports: [
            new winston.transports.File({
                'filename': log_file,
                'format': log_format
            })
        ]
    })
} else {
    module.exports = winston.createLogger({
        level: 'debug',
        transports: [
            new winston.transports.Console({'format': log_format})
        ]
    })
}
