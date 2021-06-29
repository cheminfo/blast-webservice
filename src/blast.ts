import { stat } from 'fs/promises';
import execa from 'execa';
import { BlastError } from './BlastError';
import { dataDir, blastDir } from './config';
import { join } from 'path';

interface Result {
  /* Subject sequence id */
  sseqid: 'string';
  /* Bit score */
  bitscore: 'number';
  /* E-value (probability of match with random sequence) */
  evalue: 'number';
  /* start in query sequence */
  qstart: 'number';
  /* end in query sequence */
  qend: 'number';
  /* start in subject sequence */
  sstart: 'number';
  /* end in subject sequence */
  send: 'number';
  /* aligned part of query sequence */
  qseq: 'string';
  /* aligned part of subject sequence */
  sseq: 'string';
  /* raw score */
  score: 'number';
  /* alignment length */
  length: 'number';
  /* Percentage of identical matches */
  pident: 'number';
  /* Number of identical matches */
  nident: 'number';
  /* Number of mismatches */
  mismatch: 'number';
  /* Total number of gaps */
  gaps: 'number';
  /* Number of gap openings */
  gapopen: 'number';
  /* Percentage of */
  ppos: 'number';
  /* Number of positive-scoring matches */
  positive: 'number';
  /* Query and subject frames separated by a '/' */
  frames: 'string';
  /* Query frame */
  qframe: 'string';
  /* Subject frame */
  sframe: 'string';
  /* Blast traceback operations */
  btop: 'string';
  /* Query coverage per subject */
  qcovs: 'number';
  /* Query coverage per HSP */
  qcovhsp: 'number';
  /* measure of Query Coverage that counts a position in a subject sequence for this measure only once. The second time the position is aligned to the query is not counted towards this measure */
  qcovus: 'number';
}

export type BlastResultKey = keyof Result;

const resultKeys: Record<BlastResultKey, 'string' | 'number'> = {
  sseqid: 'string',
  bitscore: 'number',
  evalue: 'number',
  qstart: 'number',
  qend: 'number',
  sstart: 'number',
  send: 'number',
  qseq: 'string',
  sseq: 'string',
  score: 'number',
  length: 'number',
  pident: 'number',
  nident: 'number',
  mismatch: 'number',
  gaps: 'number',
  gapopen: 'number',
  ppos: 'number',
  positive: 'number',
  frames: 'string',
  qframe: 'string',
  sframe: 'string',
  btop: 'string',
  qcovs: 'number',
  qcovhsp: 'number',
  qcovus: 'number',
};

export const allFormats: BlastResultKey[] = [
  'sseqid',
  'bitscore',
  'evalue',
  'qstart',
  'qend',
  'sstart',
  'send',
  'qseq',
  'sseq',
  'score',
  'length',
  'pident',
  'nident',
  'mismatch',
  'gaps',
  'gapopen',
  'ppos',
  'positive',
  'frames',
  'qframe',
  'sframe',
  'btop',
  'qcovs',
  'qcovhsp',
  'qcovus',
];

export async function blastn(
  query: string,
  options: {
    db: string;
    formats: BlastResultKey[];
    blastn?: {
      [key: string]: string | number;
    };
  },
) {
  const { formats, db, blastn } = options;
  const outfmt = `10 ${formats.join(' ')}`;
  if (!db) throw new Error('blastn: database required');
  const dbPath = join(dataDir, options.db);
  try {
    await stat(dbPath + '.nsq');
  } catch (e) {
    throw new BlastError(
      `Could not read database file ${dbPath + '.nsq'}`,
      'not_found',
    );
  }
  try {
    const { stdout } = await execa(
      cliCommand('blastn'),
      cliOptions({
        ...blastn,
        db: dbPath,
        outfmt,
      }),
      {
        input: query,
      },
    );
    return parseResult(stdout, formats);
  } catch (e) {
    throw new BlastError(e.message, 'blast');
  }
}

export async function makeblastdb(
  options: Record<string, string | number | boolean>,
  execaOptions?: execa.Options,
) {
  options = Object.assign({}, options);
  const dbId = generateDatabaseID();
  options.out = join(dataDir, dbId);
  const cmd = cliCommand('makeblastdb');
  const args = cliOptions(options);
  try {
    await execa(cmd, args, execaOptions);
    return dbId;
  } catch (e) {
    throw new BlastError(e.message, 'blast');
  }
}

export function parseResult(str: string, fields: (keyof typeof resultKeys)[]) {
  const lines = str.split('\n').filter((r) => r);
  const parsed: string[][] = lines.map((r) => r.split(','));
  const result: Partial<Result>[] = [];
  parsed.forEach((parsedEl) => {
    const resultEl: Partial<Result> = {};
    fields.forEach((field, idx) => {
      // @ts-expect-error
      resultEl[field] = extractType(parsedEl[idx], resultKeys[field]);
    });
    result.push(resultEl);
  });
  return result;
}

function cliCommand(cmd: string) {
  return join(blastDir, cmd);
}

function cliOptions(options: Record<string, string | number | boolean>) {
  let str: string[] = [];
  let keys = Object.keys(options);
  for (let key of keys) {
    str.push(`-${key}`);
    if (typeof options[key] !== 'boolean') {
      str.push(String(options[key]));
    }
  }
  return str;
}

function generateDatabaseID() {
  return (
    Math.random().toString(16).slice(2) + '-' + Math.floor(Date.now() / 1000)
  );
}

function extractType(data: string | number, type: 'string' | 'number') {
  switch (type) {
    case 'number':
      return +data;
    default:
      return data;
  }
}
