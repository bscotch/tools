import { oneline } from '@bscotch/utility';
import { Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { valid as asValidSemver } from 'semver';

/**
 * See {@link https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string}.
 *
 * Their docs are out of date for JavaScript:
 * replacing `"?P<"` with `"?<"` in the Perl-compatible regex
 * results in the JavaScript-compatible regex (with capture groups)
 * below.
 */
const semverRegex =
  /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const ajv = addFormats(new Ajv({}), [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex',
])
  .addKeyword('kind')
  .addKeyword('modifier');

const versionStoreSchemaJs = Type.Object({
  path: Type.String({
    title: 'JavaScript Version Store Path',
    description: oneline`
      Unix-style path to a Typescript or JavaScript file
      to use as a module that exports the version. Defaults
      to ESM-style unless the extension is ".cjs".`,
    pattern: '\\.(js|cjs|mjs|ts)$',
  }),
  type: Type.Union(
    [
      Type.Literal('mjs', {
        title: 'ECMAScipt Module',
        description: oneline`
        For Typescript, browsers, mjs files, and others.`,
      }),
      Type.Literal('cjs', {
        title: 'CommonJS',
        description: 'For Typescript, browsers, mjs files, and others.',
      }),
    ],
    {
      title: 'JavaScript module type',
      description: oneline`
      The type of module determines the export string to use
      in the file.
    `,
      default: 'mjs',
    },
  ),
  // TODO: export as default or named ?
});

const versionStoreSchemaJson = Type.Object({
  path: Type.String({
    title: 'JSON Version Store Path',
    description: oneline`
      Unix-style path to a JSON file in which the version
      should be stored, relative to the repo root.`,
  }),
  field: Type.String({
    title: 'Version Field',
    description: oneline`
      In which field should the version be stored?
      Defaults to 'version'. Can be provided as a
      simple string (assuming the JSON file contains
      a root object with a field by that name), a 
      JSON Pointer (e.g. '/version'), or a JSONPath
      query (e.g. '$.version').`,
    default: 'version',
  }),
});

const versionSchema = Type.Object({
  current: Type.String({
    pattern: semverRegex.source,
  }),
});

const projectSchema = Type.Object({
  name: Type.String({
    description: oneline`
    Machine-friendly project name, in kebab case,
    used for automated Git commits and tags.`,
    pattern: '^[a-z][a-z0-9-]+$',
  }),
  title: Type.Optional(
    Type.String({ description: 'Human-friendly project name.' }),
  ),
  path: Type.String({
    title: 'Project path',
    description: oneline`
      Unix-style path to the project\'s
      root directory, relative to the repo root.
      `,
    default: '.',
  }),
});

// const configSchema = Type.Object({
//   projects
// })

// current: '17.0.1',
// rules: {
//   branch: '^main$',
//   bump: ['major','minor','patch'],
// },
// references: [
//   'deploy/src/version.ts',
//   'server/package.json',
//   'site/package.json',
// ],
