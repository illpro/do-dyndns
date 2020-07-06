#!/usr/bin/env node

const poller = require('./ip-poll')
const logger = require('./log')

const DNS_DOMAIN = process.env.DNS_DOMAIN
const DNS_NAME = process.env.DNS_NAME
const DNS_TTL = process.env.DNS_TTL || 3600
const POLL_FREQUENCY = poller.parseSeconds((process.env.POLL_FREQUENCY || 8))

if (!DNS_DOMAIN) {
    logger.error('please set DNS_DOMAIN envvar')
    process.exit(1)
}

if (!DNS_NAME) {
    logger.error('please set DNS_NAME envvar')
    process.exit(1)
}

logger.info(`domain to update is ${DNS_DOMAIN}`)
logger.info(`dns record name (subdomain) will be ${DNS_NAME}`)
logger.info(`dns record ttl will be ${DNS_TTL} seconds`)
logger.info(`ip poll frequency is ${POLL_FREQUENCY/1000} seconds`)

async function main () {
    await poller.setup({
        'dns_domain': DNS_DOMAIN,
        'dns_name': DNS_NAME,
        'dns_ttl': DNS_TTL,
    })

    poller.start(POLL_FREQUENCY)
}

main()
