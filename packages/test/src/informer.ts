import { Project } from '@bscotch/versioner';

describe('Informer', function () {
  it('can load an Informer project', function () {
    const project = new Project({ dir: '../..' });
    console.log(project.packages);
  });
});
