'use strict';

const exec = require('mz/child_process').execSync;
const config = require('./config');
const path = require('path');
const BlastError = require('./BlastError');
const fs = require('fs-promise');

const resultKeys = {
    sseqid: 'string',        // Subject sequence id
    bitscore: 'number',      // Bit score
    evalue: 'number',        // E-value (probability of match with random sequence)
    qstart: 'number',        // start in query sequence
    qend: 'number',          // end in query sequence
    sstart: 'number',        // start in subject sequence
    send: 'number',          // end in subject sequence
    qseq: 'string',          // aligned part of query sequence
    sseq: 'string',          // aligned part of subject sequence
    score: 'number',         // raw score
    length: 'number',        // alignment length
    pident: 'number',        // Percentage of identical matches
    nident: 'number',        // Number of identical matches
    mismatch: 'number',      // Number of mismatches
    gaps: 'number',          // Total number of gaps
    gapopen: 'number',       // Number of gap openings
    ppos: 'number',          // Percentage of
    positive: 'number',      // Number of positive-scoring matches
    frames: 'string',        // Query and subject frames separated by a '/'
    qframe: 'string',        // Query frame
    sframe: 'string',        // Subject frame
    btop: 'string',          // Blast traceback operations
    qcovs: 'number',         // Query coverage per subject
    qcovhsp: 'number',       // Query coverage per HSP
    qcovus: 'number',        // measure of Query Coverage that counts a position in a subject sequence for this measure only once. The second time the position is aligned to the query is not counted towards this measure
};

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
    },

    parseResult(str, format) {
        let result = str.split('\n').filter(r => r);
        result = result.map(r => r.split(','));
        const parsed = new Array(result.length);
        result.forEach((row, idx) => {
            const parsedEl = parsed[idx] = {};
            format.forEach((f, idx) => parsedEl[f] = extractType(row[idx], resultKeys[f]));
        });
        return parsed;
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

function extractType(data, type) {
    switch(type) {
        case 'number':
            return +data;
            break;
        default:
            return data;
            break;
    }
}