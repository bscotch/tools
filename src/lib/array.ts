import { EmptyArray } from "./types";

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
  return typeof item == 'undefined' ? undefined : [item];
}

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
