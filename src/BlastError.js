'use strict';

class BlastError extends Error {
    constructor(message, reason) {
        super(message);
        this.reason = reason || '';
    }
}

module.exports = BlastError;
