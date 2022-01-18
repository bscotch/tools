import { configSchema, Config } from '@bscotch/repo';

describe('@bscotch/schema-builder', function () {
  it('can build a functional schema', function () {
    const validator = configSchema.compileValidator();
    const expectIsValid = (config: any) => {
      if (!validator(config)) {
        console.error(validator.errors);
        throw new Error(`Config is invalid: ${validator.errors?.join('\n')}`);
      }
    };
    const expectIsInvalid = (config: any) => {
      if (validator(config)) {
        throw new Error(`Config should not be valid`);
      }
    };
    expectIsInvalid({});
    expectIsInvalid({ bscotch: {} });
    expectIsInvalid({ name: 'hello' });
    expectIsInvalid({ version: '0.1.0-rc.1' });
    expectIsValid({ name: 'hello', version: '0.1.0-rc.1' });
    expectIsInvalid({ name: 'hello', version: 'fake-version-string' });
    expectIsValid({ name: 'hello', version: '0.1.0-rc.1', bscotch: {} });
    expectIsValid({
      name: 'hello',
      version: '0.1.0-rc.1',
      bscotch: { versioning: {} },
    });
    expectIsValid({
      name: 'hello',
      version: '0.1.0-rc.1',
      bscotch: { versioning: {} },
      extraField: 'extraValue',
    });

    let config: Config = {
      name: '@local/tools',
      version: '0.1.0-rc.1',
      bscotch: {
        versioning: { stores: { path: 'test/hello.json', field: 'version' } },
      },
    };
    expectIsValid(config);
    config = {
      name: '@local/tools',
      version: '0.1.0-rc.1',
      bscotch: {
        versioning: {
          stores: [
            { path: 'test/hello.js', style: 'commonjs' },
            {
              path: 'something.txt',
              replace: { match: '^version=', with: 'version={{version}}' },
            },
          ],
        },
      },
    };
    expectIsValid(config);
  });
});
