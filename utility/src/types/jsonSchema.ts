/**
 * @file Modified from ajv to add non-functional fields,
 * reduce complexity, and add other functionality as needed.
 */

import { EmptyObject } from './utility.js';

type UnionToIntersection<U> = (U extends any ? (_: U) => void : never) extends (
  _: infer I,
) => void
  ? I
  : never;
export type SomeJSONSchema = JSONSchemaType<Known, true>;
type PartialSchema<T> = Partial<JSONSchemaType<T, true>>;
/**
 * Primitive type
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1.1
 */
export type JSONSchemaTypeName =
  | 'string' //
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

type JSONType<
  T extends JSONSchemaTypeName,
  IsPartial extends boolean,
> = IsPartial extends true ? T | undefined : T;
interface NumberKeywords {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  format?: string;
}
interface StringKeywords {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export type JSONSchemaType<T, IsPartial extends boolean = false> =
  | true
  | ((
      | // these two unions allow arbitrary unions of types
      {
          anyOf: readonly JSONSchemaType<T, IsPartial>[];
        }
      | {
          oneOf: readonly JSONSchemaType<T, IsPartial>[];
        }
      | ({
          type: readonly (T extends number
            ? JSONType<'number' | 'integer', IsPartial>
            : T extends string
            ? JSONType<'string', IsPartial>
            : T extends boolean
            ? JSONType<'boolean', IsPartial>
            : never)[];
        } & UnionToIntersection<
          T extends number
            ? NumberKeywords
            : T extends string
            ? StringKeywords
            : T extends boolean
            ? EmptyObject
            : never
        >)
      | ((T extends number
          ? {
              type: JSONType<'number' | 'integer', IsPartial>;
            } & NumberKeywords
          : T extends string
          ? {
              type: JSONType<'string', IsPartial>;
            } & StringKeywords
          : T extends boolean
          ? {
              type: JSONType<'boolean', IsPartial>;
            }
          : T extends readonly [any, ...any[]]
          ? {
              type: JSONType<'array', IsPartial>;
              items: {
                readonly [K in keyof T]-?: JSONSchemaType<T[K], false> &
                  Nullable<T[K]>;
              } & {
                length: T['length'];
              };
              minItems: T['length'];
            } & (
              | {
                  maxItems: T['length'];
                }
              | {
                  additionalItems: false;
                }
            )
          : T extends readonly any[]
          ? {
              type: JSONType<'array', IsPartial>;
              items: JSONSchemaType<T[0], false>;
              contains?: PartialSchema<T[0]>;
              minItems?: number;
              maxItems?: number;
              minContains?: number;
              maxContains?: number;
              uniqueItems?: true;
              additionalItems?: never;
            }
          : T extends Record<string, any>
          ? {
              type: JSONType<'object', IsPartial>;
              additionalProperties?: boolean | JSONSchemaType<T[string], false>;
              unevaluatedProperties?:
                | boolean
                | JSONSchemaType<T[string], false>;
              properties?: IsPartial extends true
                ? Partial<PropertiesSchema<T>>
                : PropertiesSchema<T>;
              patternProperties?: Record<
                string,
                JSONSchemaType<T[string], false>
              >;
              propertyNames?: Omit<JSONSchemaType<string, false>, 'type'> & {
                type?: 'string';
              };
              dependencies?: {
                [K in keyof T]?: Readonly<(keyof T)[]> | PartialSchema<T>;
              };
              dependentRequired?: {
                [K in keyof T]?: Readonly<(keyof T)[]>;
              };
              dependentSchemas?: {
                [K in keyof T]?: PartialSchema<T>;
              };
              minProperties?: number;
              maxProperties?: number;
            } & (IsPartial extends true
              ? {
                  required: Readonly<(keyof T)[]>;
                }
              : [RequiredMembers<T>] extends [never]
              ? {
                  required?: Readonly<RequiredMembers<T>[]>;
                }
              : {
                  required: Readonly<RequiredMembers<T>[]>;
                })
          : T extends null
          ? {
              type: JSONType<'null', IsPartial>;
              nullable: true;
            }
          : never) & {
          allOf?: Readonly<PartialSchema<T>[]>;
          anyOf?: Readonly<PartialSchema<T>[]>;
          oneOf?: Readonly<PartialSchema<T>[]>;
          if?: PartialSchema<T>;
          then?: PartialSchema<T>;
          else?: PartialSchema<T>;
          not?: PartialSchema<T>;
        })
    ) & {
      // [keyword: string]: any;
      $id?: string;
      $ref?: string;
      title?: string;
      description?: string;
      definitions?: Record<string, JSONSchemaType<Known, true>>;
    });

type Known =
  | {
      [key: string]: Known;
    }
  | [Known, ...Known[]]
  | Known[]
  | number
  | string
  | boolean
  | null;

export type PropertiesSchema<T> = {
  [K in keyof T]-?:
    | (JSONSchemaType<T[K], false> & Nullable<T[K]>)
    | {
        $ref: string;
      };
};

export type RequiredMembers<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type Nullable<T> = undefined extends T
  ? {
      nullable: true;
      const?: null;
      enum?: Readonly<(T | null)[]>;
      default?: T | null;
    }
  : {
      const?: T;
      enum?: Readonly<T[]>;
      default?: T;
    };
