import { oneline } from '@bscotch/utility';
import { versionSchema } from './version.js';
import { Static } from '@bscotch/schema-builder';

const packageSchema = Type.Object(
  {
    name: Type.String({
      type: 'string',
      description: oneline`
    Machine-friendly project name, in kebab case,
    used for automated Git commits and tags.`,
      pattern: '^[a-z][a-z0-9-]+$',
    }),
    path: Type.Optional(
      Type.String({
        title: 'Project path',
        type: 'string',
        description: oneline`
      Unix-style path to the project\'s
      root directory, relative to the repo root.
      `,
        default: '.',
      }),
    ),
    version: versionSchema,
  },
  {
    additionalProperties: false,
  },
);

const defs = Type.StoreDefinitions({
  package: packageSchema,
});

export type ProjectConfig = Static<typeof projectConfigSchema>;
export const projectConfigSchema = Type.Object(
  {
    project: Type.Union([
      Type.Array(Type.Ref(defs, 'package'), { minItems: 1 }),
      Type.Ref(defs, 'package'),
    ]),
  },
  {
    title: 'Bscotch Versioner Configuration',
    additionalProperties: false,
  },
);
