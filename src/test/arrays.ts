import { expect } from 'chai';
import {
  valuesAreDecreasing,
  valuesAreIncreasing,
  arrayTouch,
  arrayUntouch,
  arraySortNumeric,
  arraySortNumericDescending,
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
    expect(arrayTouch(undefined)).to.eql([]);
    expect(arrayTouch(['hello'])).to.eql(['hello']);
    expect(arrayTouch('hello')).to.eql(['hello']);
  });
  it('can untouch an item (get first item if array, else return the value)', function () {
    expect(arrayUntouch(undefined)).to.be.undefined;
    expect(arrayUntouch([undefined])).to.be.undefined;
    expect(arrayUntouch([])).to.be.undefined;
    expect(arrayUntouch('hello')).to.eql('hello');
    expect(arrayUntouch(['hello', 'world'])).to.eql('hello');
  });
  it('can numerically sort arrays', function () {
    expect(arraySortNumeric([-100, 9.99, 9])).to.eql([-100, 9, 9.99]);
    expect(arraySortNumericDescending([-100, 9.99, 9])).to.eql([9.99, 9, -100]);
  });
});
