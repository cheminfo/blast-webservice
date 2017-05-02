'use strict';

const config = require('./config');
const fs = require('fs-promise');

// Create data directory
module.exports = async function() {
    await fs.mkdirp(config.dataDir);
};
