import { JsonSchemaType, oneline } from '@bscotch/utility';
import { Version, definitionSchemas as versionDefs } from './version.js';
import { createRefObject } from './helpers.js';
import { definitionSchemas as versionStoreDefs } from './versionStore.js';

export interface Config {
  projects: Project[] | Project;
}

interface Project {
  name: string;
  title?: string;
  path?: string;
  version: Version | { [versionName: string]: Version };
}

export const definitionSchemas: {
  project: JsonSchemaType<Project>;
} = {
  project: {
    type: 'object',
    required: ['name', 'version'],
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        description: oneline`
        Machine-friendly project name, in kebab case,
        used for automated Git commits and tags.`,
        pattern: '^[a-z][a-z0-9-]+$',
      },
      title: { type: 'string', description: 'Human-friendly project name.' },
      path: {
        title: 'Project path',
        type: 'string',
        description: oneline`
          Unix-style path to the project\'s
          root directory, relative to the repo root.
          `,
        default: '.',
      },
      // @ts-expect-error Type is too complex to infer properly
      version: {
        title: oneline`
            A project can have one or more managed versions, each with
            its own rules.`,
        oneOf: [
          createRefObject('version'),
          {
            type: 'object',
            additionalProperties: createRefObject('version'),
            description: oneline`
              Some projects need more than one, independently
              managed version number (such as a "build" versus
              "development" version). In that case, each version
              configuration can be referenced by its name.`,
          },
        ],
      },
    },
  },
};

export const configSchema: JsonSchemaType<Config> = {
  $id: '/bscotch-versioning-config-schema',
  type: 'object',
  title: 'Projects',
  required: ['projects'],
  properties: {
    projects: {
      oneOf: [
        {
          type: 'array',
          items: createRefObject('project'),
        },
        createRefObject('project'),
      ],
    },
  },
  additionalProperties: false,
  definitions: {
    ...definitionSchemas,
    ...versionStoreDefs,
    ...versionDefs,
  },
};
