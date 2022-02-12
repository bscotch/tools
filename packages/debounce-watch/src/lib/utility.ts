export class DebounceWatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DebounceWatchError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function assert(
  claim: any,
  message = 'Assertion failed',
): asserts claim {
  if (!claim) {
    throw new DebounceWatchError(message);
  }
}

export function explode(csvString: string | string[] | undefined) {
  if (!csvString) {
    return [];
  } else if (Array.isArray(csvString)) {
    return csvString;
  } else if (typeof csvString == 'string') {
    return csvString.split(/\s*,\s*/g);
  }
  assert(false, `Could not explode value of type ${typeof csvString}`);
}
