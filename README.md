# Digital Ocean Dynamic DNS

This module is designed to update Digital Ocean DNS records with the server's
public IP address. The process monitors the server's public IP, and when 
necessary, creates or updates a DNS A record using the Digital Ocean API.

First you will need to generate an API access token from Digital Ocean and 
create a `do.token` file in any of these locations:

    # create toke in the project directory
    echo "aaaabbbbbcccccc" | sudo tee /full/path/to/project/do.token
    
    # create token file in the app etc config
    sudo mkdir -p /etc/illpro/do-dns
    echo "aaaabbbbbcccccc" | sudo tee /etc/illpro/do-dns/do.token

    # create token file in the shell home directory
    echo "aaaabbbbbcccccc" | tee ${HOME}/do.token

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
Path where logs will be written, defaultas to /var/log/do-dns.log. File should be writable by the process owner

    export LOG_PATH=/my/path/do-dns.log


## notes
* Currently this only works with a single (1) domain.
* Project is in progres, use at you own risk ;)
* Uses Digital Ocean API v2
* Referenced the great [Deploy Node on Linux][1] doc during development



[1]: https://expeditedsecurity.com/blog/deploy-node-on-linux/