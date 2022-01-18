import { configSchema, Config } from '@bscotch/repo';
import { expect } from 'chai';

describe('@bscotch/schema-builder', function () {
  it('can build a functional schema', function () {
    const expectIsValid = (config: any) => {
      configSchema.assertIsValid(config);
    };
    const expectIsInvalid = (config: any) => {
      expect(
        configSchema.isValid(config),
        `Config should not be valid: ${JSON.stringify(config)}`,
      ).to.be.false;
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
