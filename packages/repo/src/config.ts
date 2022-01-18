/**
 * @file Configuration for @bscotch/repo tooling.
 *
 */

import { oneline } from '@bscotch/utility';
import { SchemaBuilder, StaticRoot } from '@bscotch/schema-builder';
import { versionStoreBuilder } from './config/versionStore.js';
import { packageDotJsonSchema } from '@bscotch/schema-lib';

export const configSchema = new SchemaBuilder({ lib: versionStoreBuilder })
  .addDefinitions(packageDotJsonSchema)
  .addDefinition('bscotchVersioning', function () {
    return this.Object(
      {
        stores: this.Optional(
          this.Union([
            versionStoreBuilder.root,
            this.Array(versionStoreBuilder.root),
          ]),
        ),
      },
      {
        description: oneline`
          Versioning-related information, such as
          what files need to be updated to have
          the same version as the config file,
          restrictions on versioning, etc.
        `,
      },
    );
  })
  .addDefinition('bscotchConfig', function () {
    return this.Intersect([
      packageDotJsonSchema.root,
      this.Object({
        bscotch: this.Optional(
          this.Object(
            {
              versioning: this.Optional(this.DefRef('bscotchVersioning')),
            },
            {
              title: 'Bscotch Repo Configuration',
              description: oneline`
                Configuration options for use by @bscotch/repo
                and related tools & utilities. These options
                should be set in a \`package.json\` file's
                \`"bscotch"\` field. Note that adding custom subfields
                may lead to conflicts with future Bscotch tools.`,
            },
          ),
        ),
      }),
    ]);
  })
  .setRoot('bscotchConfig');

export type Config = StaticRoot<typeof configSchema>;
