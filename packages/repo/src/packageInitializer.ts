import { SchemaBuilder, Static } from '@bscotch/schema-builder';
import fs from 'fs';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { PackageDotJson, PackageDotJsonContent } from './packageDotJson.js';

const packageNameRegex =
  /^(?<scope>@[a-z0-9-_.]{1,64}\/)?(?<name>[a-z0-9-_.]{1,64})$/;

const packageInitializerOptionsSchema = new SchemaBuilder().use(function () {
  return this.addDefinitions({
    options: this.Object({
      name: this.RegEx(packageNameRegex, {
        description: 'Package name, including scope if applicable',
      }),
      packagesDir: this.Optional(
        this.String({ description: 'Path to packages directory' }),
      ),
      repoDir: this.Optional(
        this.String({
          description:
            'Directory containing the Git repo and root package.json',
        }),
      ),
      canPublish: this.Optional(
        this.Boolean({ description: 'Whether the package can be published' }),
      ),
    }),
  }).setRoot('options');
});

export type PackageInitializerOptions = Static<
  typeof packageInitializerOptionsSchema
>;

export class PackageInitalizer {
  readonly git: SimpleGit;
  readonly rootConfig: PackageDotJsonContent;
  readonly packagesDir: string;

  constructor(private options: PackageInitializerOptions) {
    // Get all of the parameters
    packageInitializerOptionsSchema.assertIsValid(this.options);
    this.options.repoDir ||= process.cwd();
    this.git = simpleGit(this.options.repoDir);
    this.rootConfig = new PackageDotJson(this.options.repoDir).content;
    this.packagesDir = path.join(
      this.options.repoDir,
      this.options.packagesDir || '',
    );

    // Add the folders we'll need

    // Create the package directory
    fs.mkdirSync(this.path(), { recursive: true });
    // TODO: Add a package.json
    //  - Figure out how to identify the repo URL
    // TODO: Add a tsconfig.json
    // TODO: Add a README

    // Add a test folder
    fs.mkdirSync(this.path('test'), { recursive: true });
    // TODO: Add a test/index.ts file

    // Add a src folder
    fs.mkdirSync(this.path('src'), { recursive: true });
    // TODO: Add a src/index.ts file

    // TODO: Update the root tsconfig.json
    // TODO: Update the root package.json (necessary?)
  }

  path(...subpaths: string[]) {
    return path.join(this.packagesDir, this.name.name, ...subpaths);
  }

  get name() {
    const parts = this.options.name.match(packageNameRegex)!.groups as {
      scope?: string;
      name: string;
    };
    return {
      ...parts,
      fullName: parts.scope ? `${parts.scope}${parts.name}` : parts.name,
    };
  }

  get remote() {
    return this.describeRemote().then((r) => r.refs.push);
  }

  private async describeRemote() {
    const remotes = await this.git.getRemotes(true);
    return remotes[0];
  }
}

// TODO: Figure out how to instance as CLI tool if directly loaded?
