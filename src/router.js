const Router = require('koa-router');
const fastaWriter = require('./fastaWriter');
const blast = require('./blast');
const router = new Router('/');
const fs = require('fs-promise');
const config = require('./config');
const path = require('path');
const compose = require('koa-compose');

router.post('/makeblastdb', composeWithError(async function (ctx) {
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
    databaseId = await blast.makeblastdb({
        parse_seqids: true,
        dbtype: 'nucl',
        title: 'test'
    }, {
        input: fasta
    });

    ctx.status = 200;
    ctx.body = {
        ok: true,
        database: databaseId
    };
}));

router.post('/blastn', composeWithError(async function (ctx) {
    const {query, database} = ctx.request.body;
    const fmt = ['sseqid', 'bitscore', 'evalue', 'qstart', 'qend', 'sstart', 'send', 'qseq', 'sseq', 'score', 'length', 'pident', 'nident', 'mismatch', 'gaps', 'gapopen', 'ppos', 'positive', 'frames', 'qframe', 'sframe', 'btop', 'qcovs', 'qcovhsp', 'qcovus'];
    if (!query) {
        ctx.status = 400;
        ctx.body = 'Query is required';
        return;
    }

    const result = await blast.blastn({
        db: database,
        outfmt: `"10 ${fmt.join(' ')}"`
    }, {
        input: query
    });

    ctx.status = 200;
    ctx.body = blast.parseResult(result.toString(), fmt);
}));

function handleError(ctx, e) {
    console.error('error', e.message, e.stack);
    switch (e.reason) {
        case 'blast':
            ctx.status = 500;
            ctx.body = 'blast error';
            break;
        case 'not_found':
            ctx.status = 404;
            ctx.body = e.message;
            break;
        default:
            ctx.status = 500;
            ctx.body = 'Internal server error';
            break;
    }
}

async function errorMiddleware(ctx, next) {
    try {
        await next();
    } catch (e) {
        handleError(ctx, e);
    }
}

function composeWithError(middleware) {
    return compose([errorMiddleware, middleware]);
}


module.exports = router;
