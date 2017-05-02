'use strict';

const exec = require('mz/child_process').execSync;
const config = require('./config');
const path = require('path');
const BlastError = require('./BlastError');
const fs = require('fs-promise');

module.exports = {
    blastn: async function (options, ...args) {
        if(!options.db) throw new Error('blastn: database required');
        options.db = path.join(config.dataDir, options.db);
        try {
            await fs.stat(options.db + '.nsq');
        } catch(e) {
            throw new BlastError('Could not read database file', 'not_found');
        }
        const cmd = `${CLICommand('blastn')} ${CLIOptions(options)}`;
        let output;
        try {
            output = exec.apply(null, [cmd, ...args]);
        } catch(e) {
            throw new BlastError(e.message, 'blast');
        }
        return output;
    },

    makeblastdb: async function (options, ...args) {
        options = Object.assign({}, options);
        const dbId = generateDatabaseID();
        options.out = path.join(config.dataDir, dbId);
        const cmd = `${CLICommand('makeblastdb')} ${CLIOptions(options)}`;
        try {
            exec.apply(null, [cmd, ...args]);
        } catch(e) {
            throw new BlastError(e.message, 'blast')
        }
        return dbId;
    }
};

function CLICommand(cmd) {
    return path.join(config.blastDir, cmd);
}

function CLIOptions(options) {
    let str = '';
    let keys = Object.keys(options);
    for (let key of keys) {
        if (typeof options[key] === 'boolean') {
            str += ` -${key}`;
        } else {
            str += ` -${key} ${options[key]}`;
        }
    }
    return str;
}

function generateDatabaseID() {
    return Math.random().toString(16).slice(2) + '-' + Math.floor(Date.now()/1000);
}
