#!/usr/bin/env node

const DigitalOcean = require('do-wrapper').default
const fs = require('fs')
const ip = require('ip')
const logger = require('./log')
const path = require('path')
const publicIp = require('public-ip')

const tokenFile = path.join('.', 'do_access.token')

const DNS_DOMAIN = process.env.DNS_DOMAIN
const DNS_NAME = process.env.DNS_NAME
const DNS_TTL = process.env.DNS_TTL || 30
const POLL_FREQUENCY = process.env.POLL_FREQUENCY || 5000

var dns_record = {
    ip: null,
    id: null,
}

if (!DNS_DOMAIN) {
    logger.error('please set DNS_DOMAIN envvar')
    process.exit(1)
}

if (!DNS_NAME) {
    logger.error('please set DNS_NAME envvar')
    process.exit(1)
}

logger.debug(`domain to update is ${DNS_DOMAIN}`)
logger.debug(`dns record name (subdomain) will be ${DNS_NAME}`)
logger.debug(`dns record ttl will be ${DNS_TTL} milliseconds`)
logger.debug(`ip poll frequency is ${POLL_FREQUENCY/1000} seconds`)


// load token from the path specified above
function loadDoToken () {
    return new Promise((resolve, reject) => {
        fs.exists(tokenFile, function (exists) {
            if (!exists) {
                resolve()
            }
            fs.readFile(tokenFile, 'utf8', function (err, token) {
                if (err) {
                    reject(err)
                }
                resolve(token)
            })
        })
    })
}




async function main () {
    var token = await loadDoToken()
    const client = new DigitalOcean(token)

    // search all the dns records for the specified domain, looking for one that
    // matches the specified name (subdomain).
    async function getDoDnsRecord (name, domain) {
        logger.debug('getDoDnsRecord', arguments)

        var needle
        var response
        try {
            response = await client.domains.getAllRecords(domain, null, false, 1, 30)
        } catch (err) {
            logger.error(err)
            return
        }

        response.domain_records.forEach((rec) => {
            if (rec.name == name) {
                needle = rec
            }
        })

        var record_id = (needle)? needle.id : null

        logger.debug(`dns records found: ${JSON.stringify(response.domain_records.length)}`)
        logger.debug(`found matching dns record: ${JSON.stringify(needle)}`)
        logger.info(`found matching dns record: ${record_id}`)

        return record_id
    }

    // create a new digital ocean dns record for this computer's public ip.
    async function createDoDnsRecord (name, domain, ip, ttl) {
        logger.debug('createDoDnsRecord', arguments)

        var response
        try {
            response = await client.domains.createRecord(domain, {
                type: 'A',
                name: name,
                data: ip,
                ttl: ttl,
            })
        } catch (err) {
            logger.error(err)
            return
        }

        logger.debug(`create response ${JSON.stringify(response)}`)
        logger.info (`created new dns a record for ${name}.${domain} as ${ip}`)
        return response
    }

    // update the digital ocean dns record with this computer's public ip.
    async function updateDoDnsRecord (domain, id, ip) {
        logger.debug('updateDoDnsRecord', arguments)

        var response
        try {
            response = await client.domains.updateRecord(domain, id, {
                data: ip,
            })
        } catch (err) {
            logger.error(err)
            return
        }

        logger.debug(`update response ${JSON.stringify(response)}`)
        logger.info(`updated digital ocean dns record for ${domain}`)
        return response
    }

    // poll a public ip service for the computer's public ip address.
    async function ipPoll () {
        logger.profile('ran ipPoll')

        var latest_public_ip = null

        try {
            latest_public_ip = await publicIp.v4({timeout: 3000})
        } catch (err) {
            logger.error(`cannot get public ip: ${err}`)
            logger.profile('running ipPoll')
            return
        }

        if (!dns_record.ip || !ip.isEqual(latest_public_ip, dns_record.ip)) {
            dns_record.ip = latest_public_ip
            logger.warn(`ip address changed! ${latest_public_ip}`)


            
            // update the dns record on digital ocean
            dns_record.id = await getDoDnsRecord(DNS_NAME, DNS_DOMAIN)
            if (dns_record.id) {
                updateDoDnsRecord(DNS_DOMAIN, dns_record.id, dns_record.ip)
            } else {
                var record = createDoDnsRecord(DNS_NAME, DNS_DOMAIN, dns_record.ip, DNS_TTL)
                dns_record.id = record.id
            }



        } else {
            logger.debug(`ip is ${latest_public_ip}`)
        }

        logger.profile('ran ipPoll')
    }


    // start the polling
    setInterval(ipPoll, POLL_FREQUENCY)
    ipPoll()
}

main()
