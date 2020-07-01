#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// const install_path = path.join('/', 'opt', 'illpro', 'do-dns')
// fs.mkdirSync(install_path, {'recursive': true})


const service_file = path.join('.', 'scripts', 'do-dns.service')
const services_dir = path.join('/', 'etc', 'systemd', 'system')
fs.copyFileSync(service_file, path.join(services_dir, 'do-dns.service'))

