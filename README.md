# Libnode - Node JS library system

## Deployment

### Install core
1. Have node and npm installed (Either as a [binary install](https://nodejs.org/download/) or from a [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager))
2. Install bower-move: `npm install -g bower-move`
3. Optional: Install less: `npm install -g less`, if you want to build your own theme

### Build the project
1. run `npm install` from root directory
2. run `bower-move --delete` from root directory
3. run `lessc -x bootswatch.less > ../../public/custom/bootstrap_flatly_custom.min.css` from `\src\bootstrap_style`directory
4. run `ls -1 | grep -E -v 'variables.less|bootswatch.less' | xargs rm -rf
