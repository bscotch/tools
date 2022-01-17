import { oneline } from '@bscotch/utility';
import { SchemaBuilder } from '@bscotch/schema-builder';

export const versionStoreDefs = new SchemaBuilder().use(function () {
  return this.addDefinition(
    'versionStoreFile',
    this.Object({
      path: this.String({
        title: 'Version Store file path',
        type: 'string',
        description: oneline`
          Unix-style path to a file in which the
          version should be stored. If not other
          parameters are provided, the contents
          of the file will simply be replaced with
          the version string upon version bump.`,
      }),
      replace: this.Optional(
        this.Object({
          match: this.Optional(
            this.String({
              title: 'Find and replace pattern',
              description: oneline`
                A regex pattern that will be used with
                JavaScript's regex \`.replace(pattern,with)\`
                on the file's contents. For example,
                "^(const version = ).*;". If not provided,
                the whole file contents will be replaced.
              `,
              format: 'regex',
            }),
          ),
          with: this.Optional(
            this.String({
              title: 'Replacement string',
              description: oneline`
                String to replace the match pattern with,
                using JavaScript's regex \`.replace(pattern,with)\`.
                The string must contain \`{{version}}\` somewhere,
                which will be replaced with the bumped version prior
                to replacement. Group references are supported,
                e.g. if \`match\` is "^(const version = )(.*);",
                \`with\` could be "$1'{{version}}';".
              `,
              pattern: '\\{\\{version\\}\\}',
            }),
          ),
        }),
      ),
    }),
  )
    .addDefinition(
      'versionStoreJs',
      this.Object({
        path: this.String({
          title: 'JavaScript Version Store Path',
          description: oneline`
        Unix-style path to a Typescript or JavaScript file
        to use as a module that exports the version. Defaults
        to ESM-style unless the extension is ".cjs".`,
          pattern: '\\.(js|cjs|mjs|ts)$',
        }),
        style: this.Optional(
          this.LiteralUnion(['esm', 'commonjs'], {
            title: 'JavaScript Module Style',
            description: oneline`
        Unless the extension is ".cjs" or the config specifies
        'commonjs', the module style is assumed to be ESM (')
      `,
            default: 'esm',
          }),
        ),
        exportName: this.Optional(
          this.String({
            title: 'Export Name',
            type: 'string',
            description: oneline`
          If an export name is not provided (or is provided
          as the string "default"), the version string
          will be exported as an unnamed default export
          (e.g. \`export default '1.0.0'\` or
          \`module.exports = '1.0.0'\`). If a name is provided,
          it will be used as the export name (e.g.
          \`export const version = '1.0.0'\` or
          \`module.version = '1.0.0').`,
            pattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*$',
            default: 'default',
          }),
        ),
      }),
    )
    .addDefinition(
      'versionStoreJson',
      this.Object({
        path: this.String({
          title: 'JSON Version Store Path',
          type: 'string',
          description: oneline`
        Unix-style path to a JSON file in which the version
        should be stored, relative to the repo root.`,
          pattern: '\\.json[c5]?$',
        }),
        field: this.Optional(
          this.String({
            title: 'Version Field',
            type: 'string',
            description: oneline`
          In which field should the version be stored?
          Defaults to 'version'. Can be provided as a
          simple string (assuming the JSON file contains
          a root object with a field by that name), a 
          JSON Pointer (e.g. '/version'), or a JSONPath
          query (e.g. '$.version').`,
            default: 'version',
          }),
        ),
      }),
    )
    .addDefinition('versionStore', function () {
      return this.Union(
        [
          this.DefRef('versionStoreJson'),
          this.DefRef('versionStoreJs'),
          this.DefRef('versionStoreFile'),
        ],
        {
          title: 'Version Store',
          description: oneline`
        The config file maintains the source of truth
        for the version of a project. However, it's
        frequently required (or just convenient) to
        also have the version stored in other files.
        A "Version Store" is a file that gets updated
        with the version upon version bump.`,
        },
      );
    });
});
