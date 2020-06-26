#!/usr/bin/env node

const publicIp = require('public-ip')
const ip = require('ip')
const logger = require('./log')

var state = {
    ip: null,
    pollFreq: process.env.POLL_FREQ || 5000
}

logger.debug(`poll frequency is ${state.pollFreq/1000} seconds`)


async function pollIp () {
    logger.profile('ran pollIp')

    var latest_public_ip = null

    try {
        latest_public_ip = await publicIp.v4({timeout: 3000})
    } catch (err) {
        logger.error(`cannot get public ip: ${err}`)
        logger.profile('running pollIp')
        return
    }

    if (!state.ip || !ip.isEqual(latest_public_ip, state.ip)) {
        state.ip = latest_public_ip
        logger.warn(`ip address changed! ${latest_public_ip}`)
        // start a thread to update the dns record
    } else {
        logger.debug(`ip is ${latest_public_ip}`)
    }

    logger.profile('ran pollIp')
}


setInterval(pollIp, state.pollFreq)
pollIp()
