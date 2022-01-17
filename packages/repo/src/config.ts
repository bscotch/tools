/**
 * @file Configuration for @bscotch/repo tooling.
 *
 */

import { oneline } from '@bscotch/utility';
import { SchemaBuilder } from '@bscotch/schema-builder';
import { versionStoreDefs } from './config/versionStore.js';
import { packageDotJsonDefs } from '@bscotch/schema-lib';

export const configBuilder = new SchemaBuilder(versionStoreDefs)
  .addDefinitions(packageDotJsonDefs)
  .addDefinition('bscotchVersioning', function () {
    return this.Object(
      {
        stores: this.Union([
          this.DefRef('versionStore'),
          this.Array(this.DefRef('versionStore')),
        ]),
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
      this.DefRef('npmPackageFileContent'),
      this.Optional(
        this.Object({
          bscotch: this.Object(
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
        }),
      ),
    ]);
  });

const configSchema = configBuilder.WithDefs('bscotchConfig');
