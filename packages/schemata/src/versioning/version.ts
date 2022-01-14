import { oneline } from '@bscotch/utility';
// import type { Static } from '@sinclair/typebox';
import {
  versionBumpLevels,
  prereleaseRegex,
  semverRegex,
} from './constants.js';
import { Type } from './helpers.js';
import { versionStoreSchema } from './versionStore.js';

// type VersionBumpLevel = Static<typeof versionBumpLevelSchema>;
// type VersionPreleaseId = Static<typeof versionPreleaseIdSchema>;
// type VersionBumpRule = Static<typeof versionBumpRuleSchema>;
// type Version = Static<typeof versionSchema>;

const versionBumpLevelSchema = Type.ConstUnion([...versionBumpLevels], {
  title: 'Semver Bump Level',
});

const versionPreleaseIdSchema = Type.RegEx(prereleaseRegex, {
  title: 'Prerelease ID',
  description: oneline`
    The string used as the "prerelease" identifier.
    For example, version "1.0.0-alpha.1" has prerelease
    ID "alpha".
  `,
  type: 'string',
});

const semverStringSchema = Type.RegEx(semverRegex, {
  title: 'Semver String',
});

const versionLeafSchemas = Type.StoreDefinitions({
  semver: semverStringSchema,
  bumpLevel: versionBumpLevelSchema,
  prereleaseId: versionPreleaseIdSchema,
});

const versionBumpRuleSchema = Type.Partial(
  Type.Object(
    {
      branch: Type.String({
        type: 'string',
        title: 'Git Branch Pattern',
        description: oneline`
          A pattern to match against the current branch
          when an attempt is made to bump the version.
          Version bumps will only occur when they match.
          If not provided, no checks will be made against
          branch names when attempting to bump the version.
        `,
        format: 'regex',
      }),
      levels: Type.Array(Type.Ref(versionLeafSchemas, 'bumpLevel'), {
        default: versionBumpLevels,
      }),
      prereleaseIds: Type.Array(Type.Ref(versionLeafSchemas, 'prereleaseId'), {
        description: oneline`
          Allowed prerelease IDs, when using bumps like
          'prerelease' or 'preminor'.
        `,
      }),
    },
    {
      title: 'Allowed Version Bumps',
      additionalProperties: false,
    },
  ),
);

export const versionSchema = Type.Object({
  current: Type.Ref(versionLeafSchemas, 'semver'),
  rules: Type.Optional(
    Type.Array(versionBumpRuleSchema, {
      description: oneline`
        Restrict how versions get bumped, by bump level and/or
        branch pattern.
      `,
    }),
  ),
  stores: Type.Optional(
    Type.Array(versionStoreSchema, {
      description:
        'File locations where bumped version strings should be stored.',
    }),
  ),
});
