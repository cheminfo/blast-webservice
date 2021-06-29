'use strict';

import { mkdir } from 'fs/promises';
import { dataDir } from './config';

// Create data directory
export default async function init() {
  await mkdir(dataDir, { recursive: true });
}
