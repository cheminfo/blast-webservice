'use strict';

import fastifyCors from 'fastify-cors';
import { port, dataDir } from './config';

import { FileCleaner } from './FileCleaner';
import { getApp } from './app';

async function run() {
  const app = await getApp({
    logger: true,
  });
  const fileCleaner = new FileCleaner({
    TTL: '1d',
    dir: dataDir,
  });
  fileCleaner.start();
  app.register(fastifyCors, { origin: true });
  if (!port) {
    throw new Error('PORT env variable is required');
  }
  app.listen(port, (err) => {
    if (err) {
      app.log.error(err);
      fileCleaner.stop();
      process.exit(1);
    } else {
      app.log.info(`server listening on ${port}`);
    }
  });
}

run();
