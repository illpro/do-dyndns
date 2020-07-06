const fs = require('fs')
const path = require('path')
const DigitalOcean = require('do-wrapper').default

const logger = require('./log')

const tokenPaths = [
    path.resolve('do.token'),
    path.join('/', 'etc', 'illpro', 'do-dyndns', 'do.token'),
    path.join((process.env.HOME), 'do.token'),
]

function log_error(msg, err) {
    logger.error(`${msg} ${JSON.stringify(err)}`)
}

// load token from the path specified above
function loadDoToken (tokenFile) {
    return new Promise((resolve, reject) => {
            logger.debug(`looking for ${tokenFile}`)

            fs.exists(tokenFile, (exists) => {
                logger.debug(`${(exists)?'found':'cannot find'} ${tokenFile}`)

                if (!exists) {
                    reject({
                        'msg': 'token file missing',
                        'error': tokenFile,
                    })
                    return
                }

                logger.debug(`trying to read ${tokenFile}`)
                fs.readFile(tokenFile, 'utf8', function (err, token) {
                    if (err) {
                        reject({
                            'msg': 'token file unreadable',
                            'error': err,
                        })
                        return
                    }

                    logger.debug(`read ${tokenFile}`)
                    resolve({
                        'token': token,
                    })
                })
            })
    })
}

// load the digital ocean api token from a file and instaniate a new api client
// instance for making api calls.
async function newClient () {
    logger.debug('DO:newClient')

    let result
    let tokenPath

    for (let i=0; i < tokenPaths.length; i++) {
        tokenPath = tokenPaths[i]

        try {
            result = await loadDoToken(tokenPath)
        } catch (err) {
            logger.warn(`cannot load digital ocean api token "${err.msg} "${err.error}"`)
        }

        if (result && result.token) {
            break
        }
    }

    if (result && result.token && result.token.trim()) {
        return new DigitalOcean(result.token.trim())
    } else {
        throw new Error('fatal error. no digital ocean api token.')
    }
}

// search all the dns records for the specified domain, looking for one that
// matches the specified name (subdomain).
async function getDomainRecord (client, name, domain) {
    logger.debug(`DO:getDomainRecord ${name} ${domain}`)

    let needle
    let response
    try {
        response = await client.domains.getAllRecords(domain, null, false, 1, 50)
    } catch (err) {
        log_error('cannot load all domain records', JSON.stringify(err))
        return err
    }

    response.domain_records.forEach((rec) => {
        if (rec.name == name) {
            needle = rec
        }
    })

    // logger.debug(`domain records found: ${JSON.stringify(response)}`)
    logger.debug(`domain records found: ${JSON.stringify(response.domain_records.length)}`)
    if (needle) {
        logger.debug(`found matching domain record: ${JSON.stringify(needle)}`)
    } else {
        logger.debug('did not find a matching domain record')
    }

    return needle
}

// create a new digital ocean domain record for this computer's public ip.
async function createDomainRecord (client, name, domain, ttl, ip) {
    logger.debug(`DO:createDomainRecord ${name} ${domain} ${ttl} ${ip}`)

    let response
    try {
        response = await client.domains.createRecord(domain, {
            type: 'A',
            name: name,
            data: ip,
            ttl: ttl,
        })
    } catch (err) {
        log_error('cannot create domain record', JSON.stringify(err))
        return err
    }

    logger.debug(`create response ${JSON.stringify(response)}`)
    logger.info (`created new dns a record for ${name}.${domain} as ${ip}`)
    return response
}

// update the digital ocean domain record with this computer's public ip.
async function updateDomainRecord (client, domain, id, ip) {
    logger.debug(`DO:updateDomainRecord ${domain} ${id} ${ip}`)

    let response
    try {
        response = await client.domains.updateRecord(domain, id, {
            data: ip,
        })
    } catch (err) {
        log_error('cannot update domain record', JSON.stringify(err))
        return err
    }

    logger.debug(`update response ${JSON.stringify(response)}`)
    logger.info(`updated digital ocean domain record for ${domain}`)
    return response
}



module.exports = {
    'newClient': newClient,
    'getDomainRecord': getDomainRecord,
    'createDomainRecord': createDomainRecord,
    'updateDomainRecord': updateDomainRecord,
}
