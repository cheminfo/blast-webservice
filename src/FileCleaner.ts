import parseDuration from 'parse-duration';
import { readdir, stat, unlink } from 'fs/promises';
import { join, resolve } from 'path';

interface FileCleanerOptions {
  TTL: string;
  dir: string;
}
export class FileCleaner {
  private TTLString: string;
  private TTL: number;
  private dir: string;
  private duration: number;
  private _interval: NodeJS.Timeout | null;

  constructor(options: FileCleanerOptions) {
    this._interval = null;
    this.dir = resolve(join(__dirname, '..'), options.dir);
    this.TTLString = options.TTL;
    this.TTL = parseDuration(options.TTL);
    this.duration = Math.floor(this.TTL / 10);
    if (this.duration < parseDuration('1s')) {
      throw new Error('duration cannot be less than 1 minute');
    }
  }

  async run() {
    const files = (await readdir(this.dir)).map((file) => join(this.dir, file));
    for (let file of files) {
      const statValue = await stat(file);

      if (statValue.isDirectory()) continue;
      if (Date.now() - new Date(statValue.mtime).getTime() > this.TTL) {
        console.log(`Removing file ${file} (older than ${this.TTLString})`);
        await unlink(file);
      }
    }
  }

  start() {
    this.run();
    this._interval = setInterval(this.run.bind(this), this.duration);
  }

  stop() {
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
  }
}
