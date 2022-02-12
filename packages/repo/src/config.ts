import { ConfigData, configSchema } from './index.js';
import path from 'path';
import fs from 'fs';
import { assert } from './errors.js';
import { isEmptyArray, arrayWrapped } from '@bscotch/utility';
import { VersionStoreData } from './schemas/versionStore.js';

class VersionStore {
  constructor(protected config: VersionStoreData) {
    // TODO: Try to find the file
    // TODO: Convert the various store formats to a common format
    // TODO: Run the replacement
    // TODO: Set up and run some tests
  }
}

export class BscotchConfig {
  private raw: ConfigData;

  constructor(configPath: string = process.cwd()) {
    configPath = configPath.endsWith('.json')
      ? configPath
      : path.join(configPath, 'package.json');
    assert(fs.existsSync(configPath), `Config file not found at ${configPath}`);
    this.raw = configSchema.readDataSync(configPath);
  }

  get versionStores() {
    const rawStores = this.raw.bscotch?.versioning?.stores;
    if (!rawStores || isEmptyArray(rawStores)) return [];
    const stores: VersionStore[] = [];
    for (const storeData of arrayWrapped(rawStores)) {
      stores.push(new VersionStore(storeData));
    }
    return stores;
  }
}
