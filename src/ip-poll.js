// imports
const DO = require('./do-api')
const logger = require('./log')
const ip = require('ip')
const publicIp = require('public-ip')

// digital ocean client instance, make api call with this
var client

// store digital ocean domain record id and ip address 
var domain_record = {
    id: null,
    ip: null,
}

// domain config "globals" that should be configured with setup() below
var DNS_NAME
var DNS_DOMAIN
var DNS_TTL

// 
var intervalId = null

// poll a public ip service for the computer's public ip address.
async function _ipPoll () {

    // logger.profile('ran ipPoll')

    let latest_public_ip = null

    try {
        latest_public_ip = await publicIp.v4({'timeout': 3000, 'onlyHttps': true})
    } catch (err) {
        logger.error(`cannot get public ip: ${err}`)
        logger.profile('ran ipPoll')
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

    // logger.profile('ran ipPoll')
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
    }
}

// start checking the computer public ip every so ofter
async function startPoll (frequency) {
    logger.debug(`poller:start ${frequency}`)

    _ipPoll()
    frequency = frequency || 5000
    intervalId = setInterval(_ipPoll, frequency)
}

// stop polling
function stopPoll () {
    logger.debug('poller:stop')
    clearInterval(intervalId)
}



module.exports = {
    'setup': setup,
    'start': startPoll,
    'stop':  stopPoll,
}
