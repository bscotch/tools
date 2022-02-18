/**
 * @file Create types from schemas and schemas from types, given a
 * source of "truth".
 */
import { capitalize } from '@bscotch/utility';
import { program } from 'commander';
import { readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { createCdkSchemasAndTypes } from './compile/cdkSchemas.js';
import {
  downloadAndTypeRemoteSchemas,
  RemoteSchema,
} from './compile/remoteSchemas.js';
import { typesRoot } from './lib/utility.js';

const schemasToDownload: RemoteSchema[] = [
  {
    basename: 'package',
    url: 'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/package.json',
    title: 'Package',
  },
  {
    basename: 'tsconfig',
    url: 'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/tsconfig.json',
    title: 'Tsconfig',
  },
];

function updateIndex() {
  const types = readdirSync(typesRoot)
    .filter((f) => f.endsWith('.ts') && f != 'index.ts')
    .map((f) => f.replace(/\.ts$/, ''));

  const indexContents = [
    `/* Automatically generated from compile process. Do not edit! */`,
    ...types.map((t) => `export * as ${capitalize(t)} from './${t}.js';`),
  ];
  writeFileSync(path.join(typesRoot, 'index.ts'), indexContents.join('\n'));
}

interface CompilerOptions {
  updateRemoteSchemas?: boolean;
  updateCdkSchemas?: boolean;
}

async function compile(options?: CompilerOptions) {
  console.log(options);
  if (options?.updateRemoteSchemas) {
    await downloadAndTypeRemoteSchemas(schemasToDownload);
  }
  if (options?.updateCdkSchemas) {
    await createCdkSchemasAndTypes();
  }
  updateIndex();
}

program
  .option('--update-remote-schemas', 'Download and type remote schemas')
  .option(
    '--update-cdk-schemas',
    'Compile custom schemas and types for AWS CDK (requires local aws cli with proper credentials)',
  );

program.parse(process.argv);
void compile(program.opts());
