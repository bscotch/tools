import { assert, readJsonFileSync, wrapIfNotArray } from '@bscotch/utility';
import { existsSync } from 'fs';
import { gitToJs } from 'git-parse';
import path from 'path';
import git, { SimpleGit } from 'simple-git';
import { cosmiconfigSync } from 'cosmiconfig';
import { sync as globSync } from 'fast-glob';
import {
  ProjectConfig,
  ProjectOptions,
  PackageDotJson,
  LernaConfig,
} from './types.js';
import { Package } from './Package';

export class Project {
  readonly git: SimpleGit;
  readonly dir: string;
  private _config: ProjectConfig;
  private _packages: Package[];

  constructor(options?: ProjectOptions) {
    this.dir = options?.dir || process.cwd();
    assert(
      existsSync(path.join(this.dir, '.git')),
      `${this.dir} is not a Git repo`,
    );
    this.git = git(this.dir);
    assert(this.git.checkIsRepo(), `${this.dir} is not a Git repo`);

    // Load the config options
    const loadedOptions = cosmiconfigSync('versioner', {
      stopDir: this.dir,
    }).search(this.dir);
    this._config = {
      versionGroups: [],
      ...loadedOptions?.config,
    };
    this._packages = this.listPackagRoots().map((p) => new Package(this, p));
  }

  get packages() {
    return this._packages;
  }

  resolveLocalPath(...paths: string[]) {
    return path.join(this.dir, ...paths);
  }

  private loadLocalJson<Data>(...paths: string[]) {
    try {
      return readJsonFileSync<Data>(this.resolveLocalPath(...paths));
    } catch {
      return;
    }
  }

  private async parseCommits() {
    return await gitToJs(this.dir);
  }

  /**
   * Look in the project's `package.json` for the `workspaces`,
   * or a `lerna.json` for the `packages` property.
   */
  private listPackagRoots() {
    const packageJson = this.loadLocalJson<PackageDotJson>('package.json');
    const lernaJson = this.loadLocalJson<LernaConfig>('lerna.json');
    const packagePaths = wrapIfNotArray(
      lernaJson?.packages || packageJson?.workspaces || packageJson?.name,
    );
    assert(packagePaths.length > 0, 'No local packages found.');
    // Could be globs!
    return globSync(packagePaths, {
      onlyDirectories: true,
      cwd: this.dir,
    }).filter((p) => existsSync(this.resolveLocalPath(p, 'package.json')));
  }
}
