import { statSync } from 'fs';
import { resolve, join } from 'path';

const blastDirConfig = process.env.BLAST_DIRECTORY_PATH;

export const blastDir = (() => {
  if (!blastDirConfig) {
    throw new Error('BLAST_DIRECTORY_PATH env variable is required');
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

export const address = process.env.ADDRESS || '127.0.0.1';

const home = process.env.HOME || (process.env.USERPROFILE as string);
if (!home)
  throw new Error('either HOME or USERPROFILE env variables are required');

export const dataDir = join(home, '.blast-webservice');
export const port = process.env.PORT;
