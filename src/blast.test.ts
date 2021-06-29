import { makeblastdb, blastn, allFormats } from './blast';
import fastaWriter from './fastaWriter';
import { Sequences } from './schemas';

function randSeq(n: number) {
  const nucl = ['A', 'T', 'G', 'C'];
  const arr: string[] = [];
  for (let i = 0; i < n; i++) {
    const num = Math.floor(Math.random() * 4);
    arr.push(nucl[num]);
  }
  return arr.join('');
}

test('make blast db', async () => {
  const rand = randSeq(500);
  const seq: Sequences = [
    {
      id: 'seq1',
      seq: `${randSeq(2000)}AAAAA${rand}AAAAA${randSeq(2000)}`,
    },
    {
      id: 'seq2',
      seq: randSeq(4000),
    },
  ];
  const fasta = fastaWriter(seq);
  const dbId = await makeblastdb(
    {
      parse_seqids: true,
      dbtype: 'nucl',
      title: 'test',
    },
    {
      input: fasta,
    },
  );

  expect(dbId).toBeDefined();
  expect(dbId).toMatch(/^[a-f0-9]+-\d+$/);

  const result = await blastn(`TTTTT${rand}TTTTT`, {
    db: dbId,
    formats: allFormats,
  });

  expect(result.length).toBeGreaterThan(0);
  expect(result[0].length).toBe(500);
  expect(result[0].sseqid).toStrictEqual('seq1');
});
