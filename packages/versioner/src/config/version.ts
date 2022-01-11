import { JsonSchemaType, oneline } from '@bscotch/utility';
import {
  prereleasePattern,
  versionBumpLevels,
  VersionBumpLevel,
  semverPattern,
} from '../constants.js';
import { createRefObject } from './helpers.js';

type VersionBumpAllowed = {
  levels: VersionBumpLevel[];
  prereleaseId?: string;
};

interface VersionRules {
  branch?: string;
  bump?: VersionBumpAllowed[] | VersionBumpAllowed;
}

type VersionPreleaseId = string;

export type Version = {
  current: string;
  rules?: VersionRules[] | VersionRules;
};

export const definitionSchemas: {
  versionBumpLevel: JsonSchemaType<VersionBumpLevel>;
  versionPreleaseId: JsonSchemaType<VersionPreleaseId>;
  versionBumpAllowed: JsonSchemaType<VersionBumpAllowed>;
  versionRules: JsonSchemaType<VersionRules>;
  version: JsonSchemaType<Version>;
} = {
  version: {
    title: 'Version',
    type: 'object',
    required: ['current'],
    additionalProperties: false,
    properties: {
      current: {
        type: 'string',
        pattern: semverPattern,
      },
      rules: {
        oneOf: [
          { type: 'array', items: createRefObject('versionRules') },
          createRefObject('versionRules'),
        ],
      },
    },
  },
  versionBumpLevel: {
    enum: versionBumpLevels,
  },
  versionPreleaseId: {
    title: 'Prerelease ID',
    description: oneline`
      The string used as the "prerelease" identifier.
      For example, version "1.0.0-alpha.1" has prerelease
      ID "alpha".
    `,
    type: 'string',
    pattern: prereleasePattern,
  },
  versionBumpAllowed: {
    title: 'Allowed Version Bumps',
    description: oneline`
      Limits on what types of versioning bumps are allowed.
    `,
    required: ['levels'],
    type: 'object',
    additionalProperties: false,
    properties: {
      levels: {
        type: 'array',
        items: createRefObject('versionBumpLevel'),
      },
      prereleaseId: {
        title: 'Prerelease ID',
        description: oneline`
          The string used as the "prerelease" identifier.
          For example, version "1.0.0-alpha.1" has prerelease
          ID "alpha".
        `,
        type: 'string',
        pattern: prereleasePattern,
      },
    },
  },
  versionRules: {
    title: 'Version Rules',
    description: oneline`
      Rules for managing this version string.
    `,
    type: 'object',
    additionalProperties: false,
    properties: {
      branch: {
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
      },
      bump: {
        oneOf: [
          {
            type: 'array',
            items: createRefObject('versionBumpAllowed'),
          },
          createRefObject('versionBumpAllowed'),
        ],
      },
    },
  },
};
