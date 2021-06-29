import { FromSchema } from 'json-schema-to-ts';

export const sequencesSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['seq', 'id'],
    properties: {
      seq: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
    },
  },
} as const;

export const makedbSchema = {
  type: 'object',
  required: ['seq'],
  properties: {
    seq: sequencesSchema,
  },
} as const;

export const blastQuerySchema = {
  type: 'object',
  required: ['database', 'query'],
  properties: {
    database: {
      type: 'string',
    },
    query: {
      type: 'string',
    },
  },
} as const;

export type BlastnBody = FromSchema<typeof blastQuerySchema>;
export type MakeBlastDbBody = FromSchema<typeof makedbSchema>;
export type Sequences = FromSchema<typeof sequencesSchema>;
