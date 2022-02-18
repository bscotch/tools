import fetch from 'node-fetch';
import { writeSchema, writeSchemaTypes } from '../lib/utility.js';

export interface RemoteSchema {
  /**
   * The file basename (without the schema/typescript extension)
   * corresponding to this schema.
   */
  basename: string;
  url: string;
  title: string;
}

/**
 * Download a JSON Schema and generate its typescript types.
 */
async function downloadRemoteSchema(info: RemoteSchema) {
  const schema = await fetch(info.url).then((r) => r.json());
  await writeSchema(schema, info.basename);
  return schema;
}

export async function downloadAndTypeRemoteSchemas(info: RemoteSchema[]) {
  const schemas = await Promise.all(
    info.map((meta) => {
      return downloadRemoteSchema(meta).then(async (schema) => {
        await writeSchemaTypes(schema, meta.basename, meta.title);
      });
    }),
  );
  return schemas;
}
