import { assert } from './errors';

export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/** @alias isValidDate */
export const dateIsValid = isValidDate;

export function assertValidDate(date: any): asserts date is Date {
  assert(isValidDate(date), `${date} is not a date`);
}

/** @alias assertValidDate */
export const dateAssertIsValid = assertValidDate;

/** Positive if date2 is in the past. */
export function dateDifferenceMillis(date1: Date, date2: Date) {
  return date1.getTime() - date2.getTime();
}

/** Positive if date2 is in the past. */
export function dateDifferenceSeconds(date1: Date, date2: Date) {
  return dateDifferenceMillis(date1, date2) / 1000;
}

/** Positive if date2 is in the past. */
export function dateDifferenceMinutes(date1: Date, date2: Date) {
  return dateDifferenceSeconds(date1, date2) / 60;
}

/** Positive if date2 is in the past. */
export function dateDifferenceHours(date1: Date, date2: Date) {
  return dateDifferenceMinutes(date1, date2) / 60;
}

/** Positive if date2 is in the past. */
export function dateDifferenceDays(date1: Date, date2: Date) {
  return dateDifferenceHours(date1, date2) / 24;
}

export function dateIsOlderThanMillisAgo(date: Date, millisAgo: number) {
  return dateDifferenceMillis(new Date(), date) > millisAgo;
}

export function dateIsOlderThanSecondsAgo(date: Date, secondsAgo: number) {
  return dateIsOlderThanMillisAgo(date, secondsAgo * 1000);
}

export function dateIsOlderThanMinutesAgo(date: Date, minutes = 1) {
  return dateIsOlderThanSecondsAgo(date, 60 * minutes);
}

export function dateIsOlderThanHoursAgo(date: Date, hours = 1) {
  return dateIsOlderThanMinutesAgo(date, 60 * hours);
}

export function dateIsOlderThanDaysAgo(date: Date, days = 1) {
  return dateIsOlderThanHoursAgo(date, 24 * days);
}

export function dateIsInTheFuture(date: Date) {
  const nowInMilliseconds = Date.now();
  date = new Date(date);
  assertValidDate(date);
  const dateInMilliseconds = (date && date.getTime && date.getTime()) || 0;
  return dateInMilliseconds > nowInMilliseconds;
}

export function dateIsInThePast(date: Date) {
  return dateIsOlderThanSecondsAgo(date, 0);
}

export function dateIsGreaterThan(date: Date, otherDate: Date) {
  assertValidDate(date);
  assertValidDate(otherDate);
  return date > otherDate;
}

export function dateIsLessThan(date: Date, otherDate: Date) {
  assertValidDate(date);
  assertValidDate(otherDate);
  return date < otherDate;
}

export function chronologySort(date1: Date, date2: Date) {
  assertValidDate(date1);
  assertValidDate(date2);
  return date1.getTime() - date2.getTime();
}

/** @alias chronologySort */
export const dateSort = chronologySort;

export function chronologySortReverse(date1: Date, date2: Date) {
  return chronologySort(date2, date1);
}

/** @alias chronologySortReverse */
export const dateSortDescending = chronologySortReverse;

export const dates = {
  dateSort,
  dateSortDescending,
  dateDifferenceMillis,
  dateDifferenceSeconds,
  dateDifferenceMinutes,
  dateDifferenceHours,
  dateDifferenceDays,
  dateIsGreaterThan,
  dateIsInTheFuture,
  dateIsInThePast,
  dateIsLessThan,
  dateIsOlderThanMillisAgo,
  dateIsOlderThanSecondsAgo,
  dateIsOlderThanMinutesAgo,
  dateIsOlderThanHoursAgo,
  dateIsOlderThanDaysAgo,
  dateIsValid,
  dateAssertIsValid,
  isValidDate,
  assertValidDate,
  chronologySort,
  chronologySortReverse,
};
