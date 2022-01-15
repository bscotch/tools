export type EmptyArray = never[];
export type EmptyObject = Record<string, never>;
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PATCH'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type UnwrappedPromise<T> = T extends PromiseLike<infer U>
  ? UnwrappedPromise<U>
  : T;

export type AnyFunction = (...args: any[]) => any;
export type Nullish = null | undefined;
export type NotNullish<T> = Exclude<T, Nullish>;
export type NotNull<T> = Exclude<T, null>;
export type Defined<T> = Exclude<T, undefined>;
export type ArrayOrScalar<T> = T | T[];
export type UnwrappedArrayOrScalar<T> = T extends Array<infer U> ? U : T;

export type ExtractKeysByValue<Container, ValueTypeFilter> = {
  [Key in keyof Container]-?: Container[Key] extends AnyFunction
    ? ValueTypeFilter extends Container[Key]
      ? Key
      : never
    : Container[Key] extends ValueTypeFilter
    ? Key
    : never;
}[keyof Container];

export type ExcludeKeysByValue<Container, ValueTypeFilter> = Exclude<
  keyof Container,
  ExtractKeysByValue<Container, ValueTypeFilter>
>;

export type PickByValue<Container, ValueTypeFilter> = Pick<
  Container,
  ExtractKeysByValue<Container, ValueTypeFilter>
>;

export type OmitByValue<Container, ValueTypeFilter> = Omit<
  Container,
  ExtractKeysByValue<Container, ValueTypeFilter>
>;

// SPREAD (Thanks to https://stackoverflow.com/questions/49682569/typescript-merge-object-types)

type OptionalPropertyNames<T> = {
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never;
}[keyof T];

type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>;
};

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, never | keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

export type Spread<A extends readonly [...any]> = A extends [
  infer L,
  ...infer R
]
  ? SpreadTwo<L, Spread<R>>
  : unknown;

// END SPREAD

/**
 * Primitive type
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1.1
 */
export type JsonCompatible =
  | string
  | number
  | boolean
  | JsonCompatibleObject
  | JsonCompatibleArray
  | null;

// Workaround for infinite type recursion
export interface JsonCompatibleObject {
  [key: string]: JsonCompatible;
}

// Workaround for infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
export type JsonCompatibleArray = Array<JsonCompatible>;
