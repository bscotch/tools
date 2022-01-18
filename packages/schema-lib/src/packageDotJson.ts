import { SchemaBuilder } from '@bscotch/schema-builder';
import { semverSchema } from './version.js';

/**
 * Definitions for use by a package.json file.
 * {@link https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/package.json}
 */
export const packageDotJsonSchema = new SchemaBuilder({ lib: semverSchema })
  .use(function () {
    return this.addDefinition(
      '_npmPackageName',
      this.String({
        description: 'The name of the package.',
        type: 'string',
        maxLength: 214,
        minLength: 1,
        pattern: '^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$',
      }),
    ).addDefinition('npmPackageFileContent', function () {
      return this.Object(
        {
          name: this.DefRef('_npmPackageName'),
          version: this.DefRef('semver'),
        },
        {
          title: 'Bscotch Project Configuration',
        },
      );
    });
  })
  .setRoot('npmPackageFileContent');
