import {
  findParentByFileSync,
  getModuleDir,
  writeJsonFileSync,
} from '@bscotch/utility';
import { writeFileSync } from 'fs';
import { compile } from 'json-schema-to-typescript';
import path from 'path';

export const packageRoot = findParentByFileSync(
  'package.json',
  getModuleDir(import.meta),
);

export const srcRoot = path.resolve(packageRoot, 'src');

export const appRoot = path.resolve(packageRoot, 'app');

export const typesRoot = path.resolve(srcRoot, 'types');
export const schemasRoot = path.resolve(packageRoot, 'schemas');

export async function convertSchemaToTypes(
  schema: any,
  options: { title: string; basename: string },
) {
  // Clone with new Titles to get better and safer type names.
  schema.title = options.title;
  const types = await compile(schema, options.title, {
    bannerComment: `// @ts-nocheck\n/* Automatically generated from JSON Schema. Do not edit. */`,
    cwd: typesRoot,
    unreachableDefinitions: true,
  });
  return types;
}

export function writeSchema(schema: any, basename: string) {
  writeJsonFileSync(path.join(schemasRoot, `${basename}.json`), schema);
}

export function writeTypes(basename: string, types: string) {
  writeFileSync(path.join(typesRoot, `${basename}.ts`), types);
}

export async function writeSchemaTypes(
  schema: any,
  basename: string,
  title: string,
) {
  const types = await convertSchemaToTypes(schema, { basename, title });
  writeTypes(basename, types);
}
