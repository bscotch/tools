/**
 * @file Extensions to TypeBox for convenience features
 * and specific use-cases.
 */

import { assert } from '@bscotch/utility';
import {
  CustomOptions,
  TValue,
  UnionKind,
  TypeBuilder,
  TRef,
  RefKind,
  ArrayOptions,
  ArrayKind,
  StaticArray,
  TObject,
  TUnion,
  TProperties,
  ObjectOptions,
  TModifier,
  OptionalModifier,
  ReadonlyOptionalModifier,
  ObjectKind,
  TSchema,
  TArray,
} from '@sinclair/typebox';

/**
 * Additional type for `enum` schemas, created by
 * providing an array of literals (TypeBox does not
 * have this built-in).
 */
type StaticLiteralUnion<T extends readonly TValue[]> = {
  [K in keyof T]: T[K] extends TValue ? T[K] : never;
};

/**
 * Additional type for `enum` schemas, created by
 * providing an array of literals (TypeBox does not
 * have this built-in).
 */
interface TLiteralUnion<T extends TValue[]> extends TSchema, CustomOptions {
  $static: StaticLiteralUnion<T>;
  kind: typeof UnionKind;
  enum: T;
}

export class TypeBuilderExtended<
  Defs extends Record<string, TSchema> = {},
> extends TypeBuilder {
  /**
   * Create an enum schema from an array of literals,
   * resulting in a union type of those values.
   */
  public LiteralUnion<T extends TValue[]>(
    items: [...T],
    options: CustomOptions = {},
  ): TLiteralUnion<T> {
    return this.Store({ ...options, kind: UnionKind, enum: items });
  }

  //    /** `Standard` Creates an array type */
  //    public Array<T extends TSchema>(items: T, options: ArrayOptions = {}): TArray<T> {
  //     return this.Store({ ...options, kind: ArrayKind, type: 'array', items })
  // }

  // public DefineRefArray<T extends SchemaOrAssumedRef>(
  //   items: T,
  //   options: ArrayOptions = {},
  // ): TArray<ResolveRef<Defs, T>> {
  //   return this.Store({ ...options, kind: ArrayKind, type: 'array', items });
  // }

  // /**
  //  * Create an enum schema from an array of literals,
  //  * resulting in a union type of those values.
  //  */
  // public DefineLiteralUnion<T extends TValue[]>(
  //   items: [...T],
  //   options: CustomOptions = {},
  // ): NextDefName extends undefined
  //   ? never
  //   : SchemaBuilder<Spread<[Defs, Record<Defined<NextDefName>, T>]>> {
  //   assert(this.nextDefName, 'No definition name defined');
  //   const name = this.nextDefName;
  //   assert(
  //     !this.definitions.has(name as string),
  //     `Definition '${name}' already exists`,
  //   );
  //   this.definitions.set(name as string, this.LiteralUnion(items, options));
  //   this.nextDefName = undefined as any;
  //   return this as any;
  // }
}
