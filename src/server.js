'use strict';
const koa = require('koa');
const app = new koa();
const router = require('./router');
const bodyParser = require('koa-body');
const init = require('./init');
const FileCleaner = require('./FileCleaner');
const config = require('./config');

init().then(() => {
    app.listen(config.port);

    app.use(bodyParser({
        jsonLimit: '100mb'
    }));
    app.use(router.routes());
});

const fileCleaner = new FileCleaner({
    TTL: '1d',
    dir: config.dataDir
});
fileCleaner.start();
