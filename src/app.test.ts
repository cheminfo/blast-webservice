import { FastifyInstance } from 'fastify';
import { getApp } from './app';
import { BlastnBody, MakeBlastDbBody } from './schemas';

let app: FastifyInstance;

beforeAll(async () => {
  app = await getApp();
});

test('make blast DB with incomplete request payload', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/makeblastdb',
    payload: {},
  });

  expect(response.statusCode).toEqual(400);
  const parsedBody = JSON.parse(response.body);
  expect(parsedBody.message).toMatch(
    /body should have required property 'seq'/,
  );
});

test('make valid blast database and query', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/makeblastdb',
    payload: {
      seq: [
        {
          id: 'a',
          seq: 'AAAAAAAAAA',
        },
        {
          id: 'b',
          seq: 'TTTTTTTTTT',
        },
      ],
    } as MakeBlastDbBody,
  });

  expect(response.statusCode).toStrictEqual(200);
  const result = JSON.parse(response.body);
  expect(result.ok).toStrictEqual(true);
  expect(result.database).toMatch(/^[a-f0-9]+-\d+$/);

  const blastnResponse = await app.inject({
    method: 'POST',
    url: '/blastn',
    payload: {
      database: result.database,
      query: 'GGG',
    } as BlastnBody,
  });

  expect(blastnResponse.statusCode).toStrictEqual(200);
  const blastnResult = JSON.parse(blastnResponse.body);
  expect(blastnResult).toHaveLength(0);
});

test;
