'use strict';
module.exports = function(data) {
    let fasta = '';
    for(let element of data) {
       fasta += '>' + element.id + '\n' + element.seq + '\n';
    }
    return fasta;
};