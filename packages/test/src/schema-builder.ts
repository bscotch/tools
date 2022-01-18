import { expect } from 'chai';
import { configSchema, Config } from '@bscotch/repo';

describe('@bscotch/schema-builder', function () {
  it('can build a functional schema', function () {
    const config: Config = {
      name: '@local/tools',
      version: '0.1.0-rc.1',
      bscotch: {},
    };
  });
});
