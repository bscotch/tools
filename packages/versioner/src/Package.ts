import { assert, readJsonFileSync } from '@bscotch/utility';
import { existsSync } from 'fs';
import path from 'path';
import { PackageDotJson } from './types.js';
import { Project } from './Project';

export class Package {
  private packageDotJson: PackageDotJson;

  constructor(readonly project: Project, readonly workspace: string) {
    assert(
      existsSync(this.packageDotJsonFullPath),
      `${this.workspace} is not a package`,
    );
    this.packageDotJson = readJsonFileSync<PackageDotJson>(
      this.packageDotJsonFullPath,
    );
  }

  get name() {
    assert(this.packageDotJson.name, 'Package name not found.');
    return this.packageDotJson.name;
  }

  get version() {
    assert(this.packageDotJson.version, 'Package version not found.');
    return this.packageDotJson.version;
  }

  get workspaceFullpath() {
    return this.project.resolveLocalPath(this.workspace);
  }

  get packageDotJsonFullPath() {
    return path.resolve(this.workspaceFullpath, 'package.json');
  }
}
