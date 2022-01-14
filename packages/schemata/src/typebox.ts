/**
 * @file Extensions to TypeBox for convenience features
 * and specific use-cases.
 */

import { assert, Spread } from '@bscotch/utility';
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
} from '@sinclair/typebox';

export const AssumedRefKind = Symbol('AssumedRefKind');

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

interface TSchema {
  $static: unknown;
}
declare type Static<T extends TSchema> = T['$static'];

interface TAssumedRef<N> extends TSchema {
  $static: unknown;
  kind: typeof AssumedRefKind;
  __$ref: N;
}

interface TArray<T extends TSchema> extends TSchema, ArrayOptions {
  $static: StaticArray<T>;
  kind: typeof ArrayKind;
  type: 'array';
  items: T;
}

type TResolveAssumedRefs<Defs, T> = T extends TAssumedRef<infer N>
  ? N extends keyof Defs
    ? Defs[N]
    : never
  : T extends TArray<infer Q>
  ? TArray<TResolveAssumedRefs<Defs, Q>>
  : T extends TObject<infer R>
  ? TObject<{ [K in keyof R]: TResolveAssumedRefs<Defs, R[K]> }>
  : T extends TUnion<infer S>
  ? TUnion<{ [K in keyof S]: TResolveAssumedRefs<Defs, S[K]> }>
  : T;

// export interface TRef<T extends TSchema> extends TSchema, CustomOptions {
//   $static: Static<T>;
//   kind: typeof RefKind;
//   $ref: string;
// }

export class SchemaBuilder<
  Defs extends Record<string, TSchema> = {},
> extends TypeBuilder {
  public readonly definitions: Map<string, TSchema> = new Map();

  constructor(public $id?: string) {
    super();
  }

  public UseDefinition<N extends string>(
    name: N,
  ): N extends keyof Defs ? TRef<Defs[N]> : TAssumedRef<N> {
    if (!this.definitions.has(name)) {
      return { __$ref: name } as any;
    }
    return { kind: RefKind, $ref: `#/$defs/${name}` } as any;
  }

  // public Ref<Name extends (keyof Defs)>(name: Name): TRef<Defs[Name]> {
  //   // assert(this.definitions.has(name), `Definition '${name}' already exists`);
  //   return this.Store({ kind: RefKind, $ref: `#/$defs/${name}` });
  // }

  /**
   *
   */
  public AddDefinition<N extends string, T extends TSchema>(
    name: N,
    schema: T,
  ): SchemaBuilder<Defs & Record<N, TResolveAssumedRefs<Defs, T>>> {
    assert(!this.definitions.has(name), `Definition '${name}' already exists`);
    this.definitions.set(name, schema);
    return this as any;
  }

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

  private isAssumedRef(value: any): value is TAssumedRef<any> {
    return value.__$ref !== undefined;
  }

  // public Define<N extends string, S extends SchemaOrAssumedRef>(
  //   name: N,
  //   schema: S,
  // ): SchemaBuilder<Spread<[Defs, Record<N, ResolveRef<Defs, S>>]>> {
  //   assert(!this.definitions.has(name), `Definition '${name}' already exists`);
  //   if (this.isAssumedRef(schema)) {
  //     const refName = schema.__$ref;
  //     assert(
  //       this.definitions.has(refName),
  //       `Definition '${refName}' does not exist`,
  //     );
  //     this.definitions.set(name, { kind: RefKind, $ref: `#/$defs/${name}` });
  //   }
  //   this.definitions.set(name, schema);
  //   return this;
  // }
}

let Schema = new SchemaBuilder('my-config');

const meh = Schema.AddDefinition('nums', Schema.LiteralUnion([1, 2, 3]))
  .AddDefinition('moreNums', Schema.Array(Schema.Number()))
  .AddDefinition('anArray', Schema.Array(Schema.UseDefinition('nums')));
// .Object({})
// .Object({
//   woooo: Schema.Number(),
//   extraComplicated: Schema.Array(Schema.UseDefinition('moreNums')),
// });

console.log(meh);
type test = Static<typeof meh>;
