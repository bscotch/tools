import { SchemaBuilder } from '@bscotch/schema-builder';
import { semverDefs } from './version.js';

/**
 * Definitions for use by a package.json file.
 * {@link https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/package.json}
 */
export const packageDotJsonDefs = new SchemaBuilder(semverDefs).use(
  function () {
    return this.addDefinition(
      'npmPackageName',
      this.String({
        description: 'The name of the package.',
        type: 'string',
        maxLength: 214,
        minLength: 1,
        pattern: '^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$',
      }),
    ).addDefinition(
      'npmPackageFileContent',
      this.Object(
        {
          version: this.DefRef('semver'),
        },
        {
          title: 'Bscotch Project Configuration',
        },
      ),
    );
  },
);
