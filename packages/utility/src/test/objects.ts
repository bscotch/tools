import { expect } from 'chai';
import {
  asObjectIfArray,
  flattenObjectPaths,
  getValueAtPath,
  objectPathsFromWildcardPath,
  setValueAtPath,
  transformValueByPath,
} from '../lib/objects';

describe('Objects', function () {
  const createTestObject = () => {
    return {
      hello: 'world',
      nested: {
        layer: 1,
        array: [4, 6, 7],
      },
    };
  };

  const createDeepTestObject = () => {
    return {
      sequence: {
        tracks: [
          {
            keyframes: {
              Keyframes: [
                {
                  Key: 0,
                  Length: 1,
                },
                {
                  Key: 1,
                  Length: 1,
                },
              ],
            },
          },
        ],
      },
    };
  };

  it('can create a map from an array', function () {
    expect(asObjectIfArray(['hello', 'world'])).to.eql({
      '0': 'hello',
      '1': 'world',
    });
    expect(asObjectIfArray(['root', ['nested']])).to.eql({
      '0': 'root',
      '1': ['nested'],
    });
  });

  it('can flatten nested data structures', function () {
    expect(flattenObjectPaths(createTestObject())).to.eql({
      hello: 'world',
      'nested.layer': 1,
      'nested.array.0': 4,
      'nested.array.1': 6,
      'nested.array.2': 7,
    });
    expect(flattenObjectPaths(createDeepTestObject())).to.eql({
      'sequence.tracks.0.keyframes.Keyframes.0.Key': 0,
      'sequence.tracks.0.keyframes.Keyframes.0.Length': 1,
      'sequence.tracks.0.keyframes.Keyframes.1.Key': 1,
      'sequence.tracks.0.keyframes.Keyframes.1.Length': 1,
    });
  });

  it('can get values using paths', function () {
    const object = createTestObject();
    expect(getValueAtPath(object, 'hello')).to.equal('world');
    expect(getValueAtPath(object, 'hello.invalid')).to.be.undefined;
    expect(getValueAtPath(object, 'nested.array.3')).to.be.undefined;
    expect(getValueAtPath(object, 'nested.array.2')).to.equal(7);

    const deepObject = createDeepTestObject();
    expect(
      getValueAtPath(deepObject, 'sequence.tracks.0.keyframes.Keyframes.1.Key'),
    ).to.equal(1);
  });

  it('can set values using paths', function () {
    const object = createTestObject();
    setValueAtPath(object, 'hello', 'goodbye');
    expect(object.hello).to.equal('goodbye');
    setValueAtPath(object, 'nested.array.1', 5);
    expect(object.nested.array[1]).to.equal(5);
    setValueAtPath(object, 'nested.array.4', 3);
    expect(object.nested.array).to.eql([4, 5, 7, undefined, 3]);
    setValueAtPath(object, 'new.0.hello.world', 'weee');
    expect((object as any).new[0].hello.world).to.eql('weee');

    const deepObject = createDeepTestObject();
    const deepKey = 'sequence.tracks.0.keyframes.Keyframes.0.Key';
    setValueAtPath(deepObject, deepKey, 2);
    expect(getValueAtPath(deepObject, deepKey)).to.eql(2);
  });

  it('can convert a wildcard path into all matching paths', function () {
    const object = createTestObject();
    expect(objectPathsFromWildcardPath('*', object)).to.eql([
      'hello',
      'nested',
    ]);
    expect(objectPathsFromWildcardPath('*.*', object)).to.eql([
      'nested.layer',
      'nested.array',
    ]);
    expect(objectPathsFromWildcardPath('nested.*', object)).to.eql([
      'nested.layer',
      'nested.array',
    ]);
    expect(objectPathsFromWildcardPath('nested.array.*', object)).to.eql([
      'nested.array.0',
      'nested.array.1',
      'nested.array.2',
    ]);

    const deepObject = createDeepTestObject();
    expect(objectPathsFromWildcardPath('*', deepObject)).to.eql(['sequence']);
    expect(
      objectPathsFromWildcardPath(
        'sequence.tracks.*.keyframes.Keyframes.*.Key',
        deepObject,
      ),
    ).to.eql([
      'sequence.tracks.0.keyframes.Keyframes.0.Key',
      'sequence.tracks.0.keyframes.Keyframes.1.Key',
    ]);
    expect(
      objectPathsFromWildcardPath(
        'sequence.tracks.*.keyframes.Keyframes.1.Key',
        deepObject,
      ),
    ).to.eql(['sequence.tracks.0.keyframes.Keyframes.1.Key']);
  });

  it('can transform paths with wildcards', function () {
    const object = createTestObject();
    transformValueByPath(object, 'nested.layer', (n: number) => ++n);
    transformValueByPath(object, 'nested.array.0', (n: number) => ++n);
    transformValueByPath(object, 'nested.array.*', (n: number) => ++n);
    expect(object.nested.layer).to.eql(2);
    expect(object.nested.array).to.eql([6, 7, 8]);
    // Transforming a missing field should cause nothing to happen
    transformValueByPath(object, 'nested.array.3', (n: number) => ++n);
    expect(object.nested.array).to.eql([6, 7, 8]);
    // Should also be able to apply transforms to all fiels of an object.
    transformValueByPath(object, 'nested.*', () => 9);
    expect(object.nested).to.eql({ layer: 9, array: 9 });
  });
});
