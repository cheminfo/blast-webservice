'use strict';

const parseDuration = require('parse-duration');
const fs = require('fs-promise');
const path = require('path');

class FileCleaner {
    constructor(options) {
        this.dir = path.resolve(path.join(__dirname, '..'), options.dir);

        this.TTLString = options.TTL;
        this.TTL = parseDuration(options.TTL);
        this.duration = Math.floor(this.TTL / 10);
        if (this.duration < parseDuration('1s')) {
            throw new Error('duration cannot be less than 1 minute');
        }
    }

    async run() {
        const files = (await fs.readdir(this.dir)).map(file => path.join(this.dir, file));
        for (let file of files) {
            const stat = await fs.stat(file);
            if (stat.isDirectory()) continue;
            if(Date.now() - new Date(stat.mtime) > this.TTL) {
                console.log(`Removing file ${file} (older than ${this.TTLString})`);
                await fs.unlink(file);
            }
        }
    }

    start() {
        this.run();
        this._interval = setInterval(this.run.bind(this), this.duration);
    }

    stop() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
    }

}

module.exports = FileCleaner;