#!/usr/bin/env node

const publicIp = require('public-ip')
const ip = require('ip')
const {log, debug} = require('./log')

var state = {
    ip: null,
    pollFreq: process.env.POLL_FREQ || 5000
}

debug('poll frequency is', state.pollFreq, 'milliseconds')

async function pollIp () {
    debug('running pollIp')

    var i = await publicIp.v4({
        timeout: 3000
    })

    if (!state.ip || !ip.isEqual(i, state.ip)) {
        state.ip = i
        log('ip address changed!', i)
    } else {
        debug('ip is', i)
    }

    // start a thread to update the dns record
}


setInterval(pollIp, state.pollFreq)
pollIp()
