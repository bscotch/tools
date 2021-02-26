import { expect } from 'chai';
import {
  valuesAreDecreasing,
  valuesAreIncreasing,
  wrapIfNotArray,
} from '../lib/array';

describe('Arrays', () => {
  it('can tell if array values are increasing', () => {
    expect(valuesAreIncreasing([1, 2, 3, 4, 100, 99999])).to.be.true;
    expect(valuesAreIncreasing([-100, 9, 9.99])).to.be.true;
    expect(valuesAreIncreasing([1, 2, 3, 2, 6])).to.be.false;
  });
  it('can tell if array values are decreasing', () => {
    expect(valuesAreDecreasing([1, 2, 3, 4, 100, 99999])).to.be.false;
    expect(valuesAreDecreasing([1, 2, 3, 4, 100, 99999].reverse())).to.be.true;
  });
  it('can ensure a value is wrapped in an array', () => {
    expect(wrapIfNotArray(undefined)).to.eql([]);
    expect(wrapIfNotArray(['hello'])).to.eql(['hello']);
    expect(wrapIfNotArray('hello')).to.eql(['hello']);
  });
});
