const minimist = require('minimist');
const fs = require('fs');
const path = require('path');

const argv = minimist(process.argv.slice(2));
argv.blastDir = argv.blastDir || process.env.BLAST_DIRECTORY;

if(!argv.blastDir) {
    throw new Error('blastDir is a required argument');
} else {
    // check executables exist
    const blastDir = path.resolve(path.join(__dirname, '..'), argv.blastDir);
    fs.statSync(path.join(blastDir, 'blastn'));
    fs.statSync(path.join(blastDir, 'makeblastdb'));
    argv.blastDir = blastDir;
}

const home = process.env.HOME || process.env.USERPROFILE;
if(!home) throw new Error('Could not determine home directory');

argv.home = home;
argv.dataDir = path.join(home, '.blast-webservice');
argv.port = argv.port || 3000;

module.exports = argv;