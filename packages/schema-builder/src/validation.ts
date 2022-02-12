import addFormats from 'ajv-formats';
import Ajv, { Options as AjvOptions } from 'ajv/dist/2019';

export function createAjvInstance(options?: AjvOptions) {
  options = { ...options };
  const ajv = new Ajv(options)
    .addKeyword('kind')
    .addKeyword('modifier')
    // VSCode extensions to JSON Schema:
    // https://github.com/microsoft/vscode/blob/main/src/vs/base/common/jsonSchema.ts
    .addKeyword({
      keyword: 'markdownDescription',
      metaSchema: { type: 'string' },
    })
    .addKeyword({ keyword: 'errorMessage', metaSchema: { type: 'string' } })
    .addKeyword({
      keyword: 'patternErrorMessage',
      type: 'string',
      metaSchema: { type: 'string' },
    })
    .addKeyword({
      keyword: 'deprecationMessage',
      metaSchema: { type: 'string' },
    })
    .addKeyword({
      keyword: 'markdownDeprecationMessage',
      metaSchema: { type: 'string' },
    })
    .addKeyword({
      keyword: 'enumDescriptions',
      metaSchema: { type: 'array', items: { type: 'string' } },
    })
    .addKeyword({
      keyword: 'markdownEnumDescriptions',
      metaSchema: { type: 'array', items: { type: 'string' } },
    })
    .addKeyword({ keyword: 'doNotSuggest', metaSchema: { type: 'boolean' } })
    .addKeyword({
      keyword: 'suggestSortText',
      metaSchema: { type: 'string' },
    })
    .addKeyword({ keyword: 'allowComments', metaSchema: { type: 'boolean' } })
    .addKeyword({
      keyword: 'allowTrailingCommas',
      metaSchema: { type: 'boolean' },
    })
    .addKeyword({
      keyword: 'defaultSnippets',
      metaSchema: {
        type: 'array',
        items: {
          type: 'object',
          required: ['label', 'body'],
          properties: {
            label: { type: 'string' },
            description: { type: 'string' },
            body: { description: `An object that will be JSON stringified` },
            bodyText: {
              description: `An already stringified JSON object that can contain new lines (\\n) and tabs (\\t)`,
              type: 'string',
            },
          },
        },
      },
    });

  addFormats(ajv);

  return ajv;
}
