import { assert, readJsonFileSync } from '@bscotch/utility';
import { existsSync } from 'fs';
import { gitToJs } from 'git-parse';
import path from 'path';
import git, { SimpleGit } from 'simple-git';
import { cosmiconfigSync } from 'cosmiconfig';
import { Config } from './config/project.js';

export class Projects {
  readonly git: SimpleGit;
  readonly dir: string;
  private _config: Config;

  constructor(options?: { dir?: string }) {
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
}
