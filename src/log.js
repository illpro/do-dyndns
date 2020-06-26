const debug_on = process.env.DEBUG || false

function log () {
    let d = new Date().toISOString()
    let a = [d, '-', ...arguments]
    console.log.apply(null, a)
}

function debug () {
    if (!debug_on) {
        return
    }
    log(...arguments)
}

module.exports = {
    'log': log,
    'debug': debug
}
