export class BscotchRepoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BscotchRepoError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function assert(
  claim: any,
  message = 'Assertion failed',
): asserts claim {
  if (!claim) {
    throw new BscotchRepoError(message);
  }
}
