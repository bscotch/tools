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
