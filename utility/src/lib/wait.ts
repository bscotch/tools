/** Get a promise that resolves in some number of milliseconds. */
export function resolveInMillis(millis: number) {
  return new Promise((res) => setTimeout(res, millis));
}
/** @alias resolveInMillis */
export const waitForMillis = resolveInMillis;
/** @alias resolveInMillis */
export const wait = resolveInMillis;

/** Get a promise that resolves in some number of seconds. */
export function resolveInSeconds(seconds: number) {
  return resolveInMillis(seconds * 1000);
}
/** @alias resolveInSeconds */
export const waitForSeconds = resolveInSeconds;

export function resolveInNextTick() {
  return new Promise((res) => setImmediate(res));
}
/** @alias resolveInNextTick */
export const waitForTick = resolveInNextTick;

export const waits = {
  resolveInMillis,
  resolveInSeconds,
  resolveInNextTick,
  wait,
  waitForMillis,
  waitForSeconds,
  waitForTick,
};
