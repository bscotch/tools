import { readJsonFileSync } from '@bscotch/utility';
import { existsSync } from 'fs';
import path from 'path';
import { assert } from './errors.js';

export interface PackageDotJsonContent {
  name: string;
  version: string;
}

export class PackageDotJson {
  readonly path: string;
  readonly content: PackageDotJsonContent;

  constructor(readonly dir = process.cwd()) {
    assert(existsSync(this.dir), `Directory ${this.dir} does not exist`);
    this.path = path.join(this.dir, 'package.json');
    this.content = readJsonFileSync(this.path);
  }
}
