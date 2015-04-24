# Libnode - Node JS library system

## Building

### Install core
1. If you have not yet install git: [GIT download page](https://git-scm.com/downloads)
1. Have node and npm installed (Either as a [binary install](https://nodejs.org/download/) or from a [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager))
2. Install bower-move: `npm install -g bower-move`

### Build the project
1. Clone this repository or download the .zip and extract
2. Navigate with your comand line into that folder and run `npm install`. This will download all necessary backend dependencies and put them into the node_modules folder
2. Afterwards, run `bower-move`. This will download all front-end dependencies into the bower_components folder and move the compiled files into the correct /public/ subfolder. You can also pass it the  `--delete` flag, in order to delete the bower_components folder after moving.

### Optional: Themeing
If you want to re-theme, you need to install the css-preprocessor LESS to re-compile bootstrap_flatly_custom.min.css
1. Install less: `npm install -g less`, if you want to build your own theme
2. Recheck if bower-move has moved all bootstrap .less files from 'bower_components/bootstrap/less/*' to 'src/boostrap_style'.
2. Inside 'src/boostrap_style', run `lessc -x bootswatch.less > ../../public/custom/bootstrap_flatly_custom.min.css` to compile the .less files.
4. Run `ls -1 | grep -E -v 'variables.less|bootswatch.less' | xargs rm -rf` to delete all files but bootswatch.less and variables.less

## Set up server
To make it run on port 80, you first need to disable apache2 and then link port 3000 to port 80. The following has only been tried on Ubuntu.

1. Run the following in your command line to disable apache2 (if running): `sudo service apache2 stop`, or to stop autoboot: `sudo update-rc.d -f apache2 remove`
2. Link port 3000 -> port 80:
 ```
 sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
 ````
3. To do this on boot, add the following line in `/etc/rc.local`: 
 ```
 iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
 ```
 
4. Install forever for restart on errors and logs: `sudo npm install -g forever`
5) To add forever as upstart script, add the file `/etc/init/libnode.conf` with the following content:

```
description "Upstart libnode server with forever"
# make sure we can write log files and start servers
start on filesystem and started networking
stop on shutdown
env NODE_ENV=production
env PORT=3000
script
  exec forever start ~/node/libnode/bin/www
end script
pre-stop script
  exec forever stopall
end script
```