'use strict';

const exec = require('mz/child_process').execSync;
const config = require('./config');
const path = require('path');

module.exports = {
    blastn: async function (options, ...args) {
        if(!options.db) throw new Error('makeblastdb: database required');
        options.db = path.join(config.dataDir, options.db);
        const cmd = `${CLICommand('blastn')} ${CLIOptions(options)}`;
        return exec.apply(null, [cmd, ...args]);
    },

    makeblastdb: async function (options, ...args) {
        options = Object.assign({}, options);
        const dbId = generateDatabaseID();
        options.out = path.join(config.dataDir, dbId);
        const cmd = `${CLICommand('makeblastdb')} ${CLIOptions(options)}`;
        exec.apply(null, [cmd, ...args]);
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
