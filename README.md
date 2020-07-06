# Digital Ocean Dynamic DNS

This module is designed to update Digital Ocean DNS records with the server's
public IP address. The process monitors the server's public IP, and when 
necessary, creates or updates a DNS A record using the Digital Ocean API.

First you will need to generate a [Personal Access Token][1] from Digital Ocean
and place it into a `do.token` file in any of these locations:


    # create token file in the project directory to paste into
    sudo vi /full/path/to/project/do.token
    
    # create token file in the app etc config to paste into
    sudo mkdir -p /etc/illpro/do-dns
    sudo vi /etc/illpro/do-dns/do.token

    # create token file in the shell home directory to paste into
    sudo vi ${HOME}/do.token

Once you have made the `do.token` file, you need to finish configuration, in
particular you will need to define the domain you want to control with Dynamic
DNS using the two required environment variables documented below.

## options

**DNS_DOMAIN** (required)  
The domain you want to update.

    export DNS_DOMAIN=example.com

**DNS_NAME** (required)  
The subdomain you want to update. Specifically the name of the A record that
will be made or updated.

    export DNS_NAME=www


**DNS_TTL** (optional)  
Number of seconds the DNS record should be cached for, defaults to 3600 seconds.

    export DNS_TTL=100


**POLL_FREQUENCY** (optional)  
Number of seconds between public ip polls, defaults to 8 seconds.

    export POLL_FREQUENCY=10

**LOG_PATH** (optional)  
Path where logs should be written, defaults to `/var/log/do-dns.log`. File
should be writable by the process owner.

    export LOG_PATH=/my/path/do-dns.log


## notes
* Currently this only works with a single (1) domain.
* Project is in progress, use at you own risk ;)
* Uses [Digital Ocean API v2][2] and [do-wrapper][3].
* Referenced the great [Deploy Node on Linux][4] doc during development.




[1]: https://www.digitalocean.com/docs/apis-clis/api/create-personal-access-token/
[2]: https://developers.digitalocean.com/documentation/v2/
[3]: https://www.npmjs.com/package/do-wrapper
[4]: https://expeditedsecurity.com/blog/deploy-node-on-linux/