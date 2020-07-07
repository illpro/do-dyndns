// imports
const ip = require('ip')
const publicIp = require('public-ip')

// project imports
const DO = require('./do-api')
const logger = require('./log')

// digital ocean client instance, make api call with this
var client

// store digital ocean domain record id and ip address 
var domain_record = {
    'id': null,
    'ip': null,
}

// domain config "globals" that should be configured with setup() below
var DNS_NAME
var DNS_DOMAIN
var DNS_TTL

// stores the main interval id
var intervalId = null

// polling statistics
var pollCounts = {
    'success': 0,
    'failure': 0,
}

// tracks hour the "top of the hour" log is made
var lastHour = new Date().getHours()


// poll a public ip service for the computer's public ip address.
async function _ipPoll () {
    let latest_public_ip = null

    try {
        latest_public_ip = await publicIp.v4({'timeout': 3000, 'onlyHttps': true})
    } catch (err) {
        pollCounts.failure += 1
        logger.error(JSON.stringify(err))
        return
    }

    if (!domain_record.ip || !ip.isEqual(latest_public_ip, domain_record.ip)) {
        domain_record.ip = latest_public_ip
        logger.warn(`ip address changed! ${latest_public_ip}`)

        let id = domain_record.id
        let ip = domain_record.ip

        if (domain_record.id) {
            DO.updateDomainRecord(client, DNS_DOMAIN, id, ip)
        } else {
            let args = [client, DNS_NAME, DNS_DOMAIN, DNS_TTL, ip]
            let record = DO.createDomainRecord.apply(null, args)
            domain_record.id = record.id
        }
    } else {
        logger.debug(`public ip is ${latest_public_ip}`)
    }

    let currentHour = new Date().getHours()
    if (currentHour != lastHour) {
        lastHour = currentHour

        let total = pollCounts.success + pollCounts.failure
        let logMsg
        logMsg = `it's top of the hour and we have polled ${total} times, `
        logMsg += `there were ${pollCounts.failure} failures. the server ip `
        logMsg += `is still ${domain_record.ip}.`
        logger.info(logMsg)
    }

    pollCounts.success += 1
    logger.debug(`updated pollCounts ${JSON.stringify(pollCounts)}`)
}

// setup the ip poll module
async function setup (options) {
    logger.debug(`poller:setup ${JSON.stringify(options)}`)

    client = await DO.newClient()

    if ('dns_domain' in options) {
        DNS_DOMAIN = options.dns_domain
    }

    if ('dns_name' in options) {
        DNS_NAME = options.dns_name
    }

    if ('dns_ttl' in options) {
        DNS_TTL = options.dns_ttl
    }

    // fetch the configured domain A name dns record from Digital Ocean and if
    // it exists store the domain record's id and ip values.
    let record = await DO.getDomainRecord(client, DNS_NAME, DNS_DOMAIN)
    if (record && record.id) {
        domain_record.id = record.id
        domain_record.ip = record.data
        let a
        a = `${record.name}.${DNS_DOMAIN}. ${record.ttl}`
        a = `${a} IN ${record.type} ${record.data}`
        logger.info(`poller:setup found dns record. ${a}`)
    }
}

// start checking the computer public ip every so ofter
async function startPoll (frequency) {
    logger.info(`poller:run every ${frequency/1000} seconds`)

    _ipPoll()
    frequency = frequency || 5000
    intervalId = setInterval(_ipPoll, frequency)
}

// stop polling
function stopPoll () {
    logger.info('poller:stop')
    clearInterval(intervalId)
}

function parseSeconds (string) {
    let number = parseFloat(string)
    if (number >= 1) {
        number = 1000 * number
        number = Math.round(number)
    } else {
        logger.warn(`poller configuration, bad value ${number}`)
        number = 8
        logger.warn(`poller frequency set to default ${number} seconds`)
    }

    return number
}



module.exports = {
    'setup': setup,
    'start': startPoll,
    'stop':  stopPoll,
    'parseSeconds': parseSeconds,
}
