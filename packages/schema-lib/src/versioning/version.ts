import { SchemaBuilder } from '@bscotch/schema-builder';
import {
  versionBumpLevels,
  prereleaseRegex,
  semverRegex,
  oneline,
} from '@bscotch/utility';

// type VersionBumpLevel = Static<typeof versionBumpLevelSchema>;
// type VersionPreleaseId = Static<typeof versionPreleaseIdSchema>;
// type VersionBumpRule = Static<typeof versionBumpRuleSchema>;
// type Version = Static<typeof versionSchema>;

export const semver = new SchemaBuilder().use(function () {
  this.addDefinitions({
    bumpLevel: this.LiteralUnion([...versionBumpLevels], {
      title: 'Semver Bump Level',
    }),
    prereleaseId: this.RegEx(prereleaseRegex, {
      title: 'Prerelease ID',
      description: oneline`
        The string used as the "prerelease" identifier.
        For example, version "1.0.0-alpha.1" has prerelease
        ID "alpha".
      `,
      type: 'string',
    }),
    semver: this.RegEx(semverRegex, {
      title: 'Semver',
      description: oneline`
        A semver version string, according to
        https://semver.org/
      `,
      markdownDescription: oneline`
        A [semver version string](https://semver.org/).
      `,
    }),
  });
});
