import { FromSchema } from 'json-schema-to-ts';
import { sequencesSchema } from './schemas';

export default function (data: FromSchema<typeof sequencesSchema>) {
  let fasta = '';
  for (let element of data) {
    fasta += '>' + element.id + '\n' + element.seq + '\n';
  }
  return fasta;
}
