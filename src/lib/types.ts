export type EmptyArray = [];
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
export type UnwrappedPromise<T> = T extends PromiseLike<infer U>
  ? UnwrappedPromise<U>
  : T;
export type AnyFunction = (...args: any[]) => any;
