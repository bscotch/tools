import { Projects } from '@bscotch/versioner';

describe('Informer', function () {
  it('can load an Informer project', function () {
    const project = new Projects({ dir: '../..' });
  });
});
