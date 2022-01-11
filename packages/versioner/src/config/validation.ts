import Ajv from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import { Config, configSchema } from './project.js';

const ajv = new Ajv().addKeyword('kind').addKeyword('modifier');

addFormats(ajv, [
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
]);

const configValidator = ajv.compile(configSchema);

export function assertValidConfig(config: Config) {
  const valid = configValidator(config);
  if (!valid) {
    throw new Error(
      `Invalid config: ${JSON.stringify(configValidator.errors, null, 2)}`,
    );
  }
}
