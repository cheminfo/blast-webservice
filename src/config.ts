import { statSync } from 'fs';
import { resolve, join } from 'path';

const blastDirConfig = process.env.BLAST_DIRECTORY;

export const blastDir = (() => {
  if (!blastDirConfig) {
    throw new Error('BLAST_DIRECTORY env variable is required');
  } else {
    // check executables exist
    const blastDir = resolve(join(__dirname, '..'), blastDirConfig);
    statSync(join(blastDir, 'blastn'));
    statSync(join(blastDir, 'makeblastdb'));
    return blastDir;
  }
})();

if (!blastDir) {
  throw new Error('unreachable');
}

const home = process.env.HOME || (process.env.USERPROFILE as string);
if (!home)
  throw new Error('either HOME or USERPROFILE env variables are required');

export const dataDir = join(home, '.blast-webservice');
export const port = process.env.PORT;
