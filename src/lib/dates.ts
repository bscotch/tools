import { assert } from './errors';

export function isValidDate(date: Date) {
  return date instanceof Date && !isNaN(date?.getTime?.());
}

export function assertValidDate(date: Date) {
  assert(isValidDate(date), `${date} is not a date`);
}

export function dateIsOlderThanSecondsAgo(date: Date, secondsAgo: number) {
  const nowInMilliseconds = Date.now();
  const dateInMilliseconds = (date && date.getTime && date.getTime()) || 0;
  const millisecondsAgo = secondsAgo * 1000;
  return nowInMilliseconds - millisecondsAgo > dateInMilliseconds;
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

export function chronologySortReverse(date1: Date, date2: Date) {
  return chronologySort(date2, date1);
}

export const dates = {
  assertValidDate,
  chronologySort,
  chronologySortReverse,
  dateIsGreaterThan,
  dateIsInTheFuture,
  dateIsInThePast,
  dateIsLessThan,
  dateIsOlderThanDaysAgo,
  dateIsOlderThanHoursAgo,
  dateIsOlderThanMinutesAgo,
  dateIsOlderThanSecondsAgo,
  isValidDate,
};
