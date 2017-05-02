'use strict';
const koa = require('koa');
const app = new koa();
const router = require('./router');
const bodyParser = require('koa-body');
const init = require('./init');

init().then(() => {
    app.listen(3000);

    app.use(bodyParser());
    app.use(router.routes());
});
