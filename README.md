# do-dns
Digital Ocean DNS Updating Daemon

This module can be configured to update Digital Ocean DNS records, and will do
so if its monitoring of the computer's public ip address ever changes.

To start the proces in a developer friendly "debug" mode do this:

    npm run start

Eventually you will most likely want to run this as a daemon on a computer of
yours, if you are using a flavor of linux that supports systemd I will include
a service file you can use.

##### notes
* Currently this only works with a single (1) domain.
* Project is in progres, use at you own risk ;)

##### read
* https://expeditedsecurity.com/blog/deploy-node-on-linux/
