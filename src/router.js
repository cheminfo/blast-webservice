const Router = require('koa-router');
const fastaWriter = require('./fastaWriter');
const blast = require('./blast');
const router = new Router('/');
const fs = require('fs-extra-promise');
const config = require('./config');
const path = require('path');

router.post('/makeblastdb', async function (ctx) {
    const seq = ctx.request.body.seq;
    if (!seq) {
        ctx.status = 400;
        ctx.body = 'Sequence is required';
        return;
    }
    await fs.mkdirp(config.dataDir);
    await fs.mkdirp(path.join(config.home, '.blast-webservice'));
    const fasta = fastaWriter(seq);
    let databaseId;
    try {
        databaseId = await blast.makeblastdb({
            parse_seqids: true,
            dbtype: 'nucl',
            title: 'test'
        }, {
            input: fasta
        });
    } catch(e) {
        console.error('makeblastdb failed', e);
        ctx.status = 500;
        ctx.body = 'Internal server error';
    }

    ctx.status = 200;
    ctx.body = {
        ok:true,
        database: databaseId
    };
});

router.post('/blastn', async function (ctx) {
    const {query, database} = ctx.request.body;
    if (!query) {
        ctx.status = 400;
        ctx.body = 'Query is mandatory';
        return;
    }

    const result = await blast.blastn({
        db: database,
        outfmt: '"10 sseqid bitscore evalue qstart qend sstart send"'
    }, {
        input: query
    });

    ctx.status = 200;
    ctx.body = result.toString();
});


module.exports = router;
