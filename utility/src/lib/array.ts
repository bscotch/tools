import { EmptyArray } from '../types/utility';

/**
 * If the provided value is not an array,
 * wrap it in an array. If the value is undefined
 * will return an empty array.
 */
export function wrapIfNotArray<Item>(
  item: Item,
): Item extends any[] ? Item : Item extends undefined ? [] : [Item] {
  if (Array.isArray(item)) {
    // @ts-expect-error Help! Does work, but Typescript doesn't like it.
    return item;
  }
  // @ts-expect-error Help! Does work, but Typescript doesn't like it.
  return typeof item == 'undefined' ? [] : [item];
}

/** @alias wrapIfNotArray */
export const arrayTouch = wrapIfNotArray;

/**
 * Return `true` if the `comparison` function returns true
 * when applied to each adjacent pair of values. For example,
 * can be used to determine if an array of numbers is increasing
 * with `(current,last)=>current>last`.
 */
export function eachTruthyComparedToLast<ArrayOfComparables extends any[]>(
  arrayOfComparables: ArrayOfComparables,
  comparison: (
    currentValue: ArrayOfComparables[number],
    lastValue: ArrayOfComparables[number],
  ) => boolean,
) {
  return arrayOfComparables.every(
    (value: ArrayOfComparables[number], i: number) => {
      if (i === 0) {
        return true;
      }
      return comparison(value, arrayOfComparables[i - 1]);
    },
  );
}
/** @alias eachTruthyComparedToLast */
export const arrayEachTruthyComparedToLast = eachTruthyComparedToLast;

/**
 * Return true if each value is greater than the last
 */
export function valuesAreIncreasing<ArrayOfValues extends any[]>(
  increasingArray: ArrayOfValues,
) {
  return eachTruthyComparedToLast(
    increasingArray,
    (curr: ArrayOfValues[number], last: ArrayOfValues[number]) => curr > last,
  );
}
/** @alias valuesAreIncreasing */
export const arrayValuesAreIncreasing = valuesAreIncreasing;

/**
 * Return true if each value is greater than the last
 */
export function valuesAreDecreasing<ArrayOfValues extends any[]>(
  decreasingArray: ArrayOfValues,
) {
  return eachTruthyComparedToLast(
    decreasingArray,
    (curr: ArrayOfValues[number], last: ArrayOfValues[number]) => curr < last,
  );
}
/** @alias valuesAreDecreasing */
export const arrayValuesAreDecreasing = valuesAreDecreasing;

type FirstItemArray<Item> =
  | Item[]
  | [Item, ...any[]]
  | Readonly<[Item, ...any[]]>
  | EmptyArray;

/**
 * If not an array, return self. Otherwise return 0th item.
 */
export function selfOrFirstItem<Item extends any>(
  items: FirstItemArray<Item> | Item,
): Item extends EmptyArray ? undefined : Item {
  if (items instanceof Array) {
    // @ts-expect-error can't figure out how to get this to behave,
    // but it does work as intended!
    return items[0];
  }
  // @ts-expect-error (see prior comment)
  return items;
}
/** @alias selfOrFirstItem */
export const arrayUntouch = selfOrFirstItem;

type SortReturn = number;

function sortResult<N extends number[]>(
  numbers: N,
  descending?: boolean,
): number[];
function sortResult<N extends number>(
  array1Item: N,
  array2Item: N,
  descending?: boolean,
): SortReturn;
function sortResult<N extends number | number[]>(
  numbersOrArrayItem1: N,
  array2ItemOrDescending?: number | boolean,
  descending = false,
): N extends number ? SortReturn : number[] {
  if (typeof numbersOrArrayItem1 == 'number') {
    if (typeof array2ItemOrDescending != 'number') {
      throw new Error('Second argument must be a number');
    }
    const diff = numbersOrArrayItem1 - array2ItemOrDescending;
    // @ts-ignore
    return descending ? -diff : diff;
  } else if (Array.isArray(numbersOrArrayItem1)) {
    // @ts-ignore
    return numbersOrArrayItem1.sort((a, b) => sortResult(a, b, descending));
  }
  throw new Error('Invalid arguments for arraySortNumeric');
}

/**
 * Ascending-sort an array of numeric values.
 * Can call on an array, or pass to `Array.sort`
 *
 * ```js
 * const array = [10,3,11];
 * // Both ways work
 * arraySortNumeric(array);
 * array.sort(arraySortNumeric);
 * ```
 */
export function arraySortNumeric<N extends number[]>(numbers: N): number[];
export function arraySortNumeric<N extends number>(
  array1Item: N,
  array2Item: N,
): SortReturn;
export function arraySortNumeric<N extends number | number[]>(
  numbersOrArrayItem1: N,
  array2Item?: number,
): N extends number ? SortReturn : number[] {
  // @ts-ignore
  return sortResult(numbersOrArrayItem1, array2Item);
}

/**
 * Descending-sort an array of numeric values.
 * Can call on an array, or pass to `Array.sort`
 *
 * ```js
 * const array = [10,3,11];
 * // Both ways work
 * arraySortNumericDescending(array);
 * array.sort(arraySortNumericDescending);
 * ```
 */
export function arraySortNumericDescending<N extends number[]>(
  numbers: N,
): number[];
export function arraySortNumericDescending<N extends number>(
  array1Item: N,
  array2Item: N,
): SortReturn;
export function arraySortNumericDescending<N extends number | number[]>(
  numbersOrArrayItem1: N,
  array2Item?: number,
): N extends number ? SortReturn : number[] {
  // @ts-ignore
  return sortResult(numbersOrArrayItem1, array2Item, true);
}

export const array = {
  arrayTouch,
  arrayEachTruthyComparedToLast,
  arrayUntouch,
  arrayValuesAreDecreasing,
  arrayValuesAreIncreasing,
  arraySortNumeric,
  arraySortNumericDescending,
  eachTruthyComparedToLast,
  selfOrFirstItem,
  valuesAreDecreasing,
  valuesAreIncreasing,
  wrapIfNotArray,
};
