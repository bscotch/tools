import { expect } from 'chai';
import {
  arrayIsDecreasing,
  arrayIsIncreasing,
  arraySortNumeric,
  arraySortNumericDescending,
  arrayUnwrapped,
  arrayWrapped,
} from '../lib/array';

describe('Arrays', () => {
  it('can tell if array values are increasing', () => {
    expect(arrayIsIncreasing([1, 2, 3, 4, 100, 99999])).to.be.true;
    expect(arrayIsIncreasing([-100, 9, 9.99])).to.be.true;
    expect(arrayIsIncreasing([1, 2, 3, 2, 6])).to.be.false;
  });
  it('can tell if array values are decreasing', () => {
    expect(arrayIsDecreasing([1, 2, 3, 4, 100, 99999])).to.be.false;
    expect(arrayIsDecreasing([1, 2, 3, 4, 100, 99999].reverse())).to.be.true;
  });
  it('can ensure a value is wrapped in an array', () => {
    expect(arrayWrapped(undefined)).to.eql([]);
    expect(arrayWrapped(['hello'])).to.eql(['hello']);
    expect(arrayWrapped('hello')).to.eql(['hello']);
  });
  it('can untouch an item (get first item if array, else return the value)', function () {
    expect(arrayUnwrapped(undefined)).to.be.undefined;
    expect(arrayUnwrapped([undefined])).to.be.undefined;
    expect(arrayUnwrapped([])).to.be.undefined;
    expect(arrayUnwrapped('hello')).to.eql('hello');
    expect(arrayUnwrapped(['hello', 'world'])).to.eql('hello');
  });
  it('can numerically sort arrays', function () {
    expect(arraySortNumeric([-100, 9.99, 9])).to.eql([-100, 9, 9.99]);
    expect(arraySortNumericDescending([-100, 9.99, 9])).to.eql([9.99, 9, -100]);
  });
});
