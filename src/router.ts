import { FromSchema } from 'json-schema-to-ts';
import fastaWriter from './fastaWriter';

import { FastifyInstance } from 'fastify';
import {
  BlastnBody,
  blastQuerySchema,
  MakeBlastDbBody,
  makedbSchema,
} from './schemas';
import { blastn, allFormats, makeblastdb } from './blast';

export default function (app: FastifyInstance) {
  app.post<{ Body: MakeBlastDbBody }>('/makeblastdb', {
    handler: async function (ctx) {
      const seq = ctx.body.seq;

      const fasta = fastaWriter(seq);
      let databaseId;
      databaseId = await makeblastdb(
        {
          parse_seqids: true,
          dbtype: 'nucl',
          title: 'test',
        },
        {
          input: fasta,
        },
      );

      return {
        ok: true,
        database: databaseId,
      };
    },
    schema: {
      body: makedbSchema,
    },
  });

  app.post<{ Body: BlastnBody }>('/blastn', {
    handler: async function (ctx) {
      const { query, database } = ctx.body;

      const result = await blastn(query, {
        db: database,
        formats: allFormats,
      });
      return result;
    },
    schema: {
      body: blastQuerySchema,
    },
  });
}
