const path = require('path')
const winston = require('winston')

const log_file = path.join('/', 'var', 'log', 'do-dns.log')
const log_format = winston.format.simple()

if (process.env.NODE_ENV === 'production') {
    module.exports = winston.createLogger({
        level: 'warn',
        transports: [
            new winston.transports.File({
                'filename': log_file,
                'format': log_format
            })
        ]
    })
} else {
    module.exports = winston.createLogger({
        level: 'warn',
        transports: [
            new winston.transports.Console({'format': log_format})
        ]
    })
}
