import { assert, readJsonFileSync } from '@bscotch/utility';
import { existsSync } from 'fs';
import path from 'path';
import { Projects } from './Projects';

interface PackageDotJson {
  version: string;
  name: string;
}

export class Package {
  private packageDotJson: PackageDotJson;

  constructor(readonly project: Projects, readonly workspace: string) {
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
