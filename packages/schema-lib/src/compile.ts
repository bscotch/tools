/**
 * @file Create types from schemas and schemas from types, given a
 * source of "truth".
 */
import { capitalize, writeJsonFileSync } from '@bscotch/utility';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { compile } from 'json-schema-to-typescript';
import fetch from 'node-fetch';
import path from 'path';

const dir = path.dirname(import.meta.url).replace(/^file:\/+/, '');
const typesRoot = path.join(dir, '..', 'src', 'artifacts');
const schemasRoot = path.join(dir, '../schemas');

interface SchemaDownload {
  /**
   * The file basename (without the schema/typescript extension)
   * corresponding to this schema.
   */
  basename: string;
  url: string;
  title: string;
}

const schemaDownload: SchemaDownload[] = [
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

function writeSchema(basename: string, schema: any) {
  writeJsonFileSync(path.join(schemasRoot, `${basename}.json`), schema);
}

function writeTypes(basename: string, types: string) {
  writeFileSync(path.join(typesRoot, `${basename}.ts`), types);
}

async function convertSchemaToTypes(schema: any, options: SchemaDownload) {
  // Clone with new Titles to get better and safer type names.
  schema.title = options.title;
  const types = await compile(schema, options.title, {
    bannerComment: `// @ts-nocheck\n/* Automatically generated from JSON Schema. Do not edit. */`,
    cwd: typesRoot,
    unreachableDefinitions: true,
  });
  writeTypes(options.basename, types);
}

/**
 * Download a JSON Schema and generate its typescript types.
 */
async function downloadAndConvertSchemaToTypes(info: SchemaDownload) {
  const schema = await fetch(info.url).then((r) => r.json());
  writeSchema(info.basename, schema);
  await convertSchemaToTypes(schema, info);
}

function createIndex() {
  const types = readdirSync(typesRoot)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.replace(/\.ts$/, ''));

  const indexContents = [
    `/* Automatically generated from compile process. Do not edit! */`,
    ...types.map((t) => `export * as ${capitalize(t)} from './${t}.js';`),
  ];
  writeFileSync(path.join(typesRoot, 'index.ts'), indexContents.join('\n'));
}

function nukeFolder(folder: string) {
  try {
    rmSync(folder, { recursive: true });
  } catch {}
  mkdirSync(folder, { recursive: true });
}

async function main() {
  nukeFolder(typesRoot);
  nukeFolder(schemasRoot);
  await Promise.all(schemaDownload.map(downloadAndConvertSchemaToTypes));
  createIndex();
}

void main();
