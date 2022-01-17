import { SchemaBuilder, StaticDefs } from '@bscotch/schema-builder';
import {
  versionBumpLevels,
  prereleaseRegex,
  semverRegex,
  oneline,
} from '@bscotch/utility';

export type SemverDefs = StaticDefs<typeof semverDefs>;

export const semverDefs = new SchemaBuilder().use(function () {
  return this.addDefinitions({
    semverBumpLevel: this.LiteralUnion([...versionBumpLevels], {
      title: 'Semver Bump Level',
    }),
    semverPrereleaseId: this.RegEx(prereleaseRegex, {
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
