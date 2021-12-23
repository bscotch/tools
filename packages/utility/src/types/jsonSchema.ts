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
// type SomeJsonSchema = JSONSchemaType<Known, true>;
type PartialSchema<T> = Partial<JsonSchemaType<T, true>>;
/**
 * Primitive type
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1.1
 */
export type JsonSchemaTypeName =
  | 'string' //
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

type JsonType<
  T extends JsonSchemaTypeName,
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

export type JsonSchemaType<T, IsPartial extends boolean = false> =
  | true
  | ((
      | // these two unions allow arbitrary unions of types
      {
          anyOf: readonly JsonSchemaType<T, IsPartial>[];
        }
      | {
          oneOf: readonly JsonSchemaType<T, IsPartial>[];
        }
      | ({
          type: readonly (T extends number
            ? JsonType<'number' | 'integer', IsPartial>
            : T extends string
            ? JsonType<'string', IsPartial>
            : T extends boolean
            ? JsonType<'boolean', IsPartial>
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
              type: JsonType<'number' | 'integer', IsPartial>;
            } & NumberKeywords
          : T extends string
          ? {
              type: JsonType<'string', IsPartial>;
            } & StringKeywords
          : T extends boolean
          ? {
              type: JsonType<'boolean', IsPartial>;
            }
          : T extends readonly [any, ...any[]]
          ? {
              type: JsonType<'array', IsPartial>;
              items: {
                readonly [K in keyof T]-?: JsonSchemaType<T[K], false> &
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
              type: JsonType<'array', IsPartial>;
              items: JsonSchemaType<T[0], false>;
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
              type: JsonType<'object', IsPartial>;
              additionalProperties?: boolean | JsonSchemaType<T[string], false>;
              unevaluatedProperties?:
                | boolean
                | JsonSchemaType<T[string], false>;
              properties?: IsPartial extends true
                ? Partial<PropertiesSchema<T>>
                : PropertiesSchema<T>;
              patternProperties?: Record<
                string,
                JsonSchemaType<T[string], false>
              >;
              propertyNames?: Omit<JsonSchemaType<string, false>, 'type'> & {
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
              type: JsonType<'null', IsPartial>;
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
      definitions?: Record<string, JsonSchemaType<Known, true>>;
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
    | (JsonSchemaType<T[K], false> & Nullable<T[K]>)
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
