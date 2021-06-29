'use strict';

import fastify, { FastifyServerOptions } from 'fastify';
import init from './init';

import registerRoutes from './router';

export function getApp(options?: FastifyServerOptions) {
  const app = fastify(options);
  return init()
    .then(() => {
      registerRoutes(app);
      return app;
    })
    .catch((e) => {
      console.error('error caught during initialization');
      console.error(e);
      process.exit(1);
    });
}
