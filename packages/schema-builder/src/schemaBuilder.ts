/**
 * @file Extensions to TypeBox for convenience features
 * and specific use-cases.
 */

import {
  CustomOptions,
  TValue,
  UnionKind,
  TypeBuilder,
  RefKind,
  TRef,
  TSchema,
} from '@sinclair/typebox';
import { assert, Spread } from '@bscotch/utility';

type BuilderDefs = Record<string, TSchema>;

type BuilderWithDefs<
  OldDefs extends BuilderDefs,
  NewDefs extends BuilderDefs,
> = SchemaBuilder<OldDefs & NewDefs>;

type BuilderDefGenerator<OldDefs extends BuilderDefs, T extends TSchema> = (
  this: SchemaBuilder<OldDefs>,
) => T;

type BuilderDefsGenerator<
  OldDefs extends BuilderDefs,
  NewDefs extends BuilderDefs,
> = (this: SchemaBuilder<OldDefs>) => NewDefs;

type LibsFromBuilders<Builders extends SchemaBuilder<any>[]> = {
  [B in keyof Builders]: Builders[B] extends SchemaBuilder<any>
    ? Builders[B]['$defs']
    : never;
};

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

/**
 * A `SchemaBuilder` instance provides storage for schema
 * definitions (for use in `$ref`s) and for creating a Schema
 * that uses them, all with full Typescript support.
 *
 * The API is designed to enable
 *
 * (Powered by TypeBox)
 */
export class SchemaBuilder<Defs extends BuilderDefs = {}> extends TypeBuilder {
  readonly $defs: Defs = {} as Defs;

  constructor($defs?: Defs | SchemaBuilder<Defs>) {
    super();
    if ($defs) {
      this.addDefinitions($defs);
    }
  }

  /**
   * Create a `$ref` reference to a schema definition that
   * this `SchemaBuilder` knows about
   * (e.g. it was provided via `addDefinition`).
   */
  public DefRef<N extends keyof Defs>(name: N): TRef<Defs[N]> {
    this.assertDefExists(name as string);
    return { kind: RefKind, $ref: `#/$defs/${name}` } as any;
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

  private findDef<N extends string>(
    name: N,
  ): N extends keyof Defs ? Defs[N] : undefined {
    return this.$defs[name] as any;
  }

  private assertDefExists<N extends string>(
    name: N,
  ): N extends keyof Defs ? Defs[N] : never {
    const def = this.findDef(name);
    assert(def, `Definition '${name}' does not exist`);
    return def as any;
  }

  /**
   * Add a new schema to the stored definitions, for use
   * in local references for a final schema.
   */
  public addDefinition<N extends string, T extends TSchema>(
    name: N,
    schema: T | BuilderDefGenerator<Defs, T>,
  ): SchemaBuilder<Spread<[Defs, Record<N, T>]>> {
    this.assertDefExists(name);
    // @ts-expect-error The `[name]` index does not exist on `this.$defs`
    // until the newly-typed `this` is returned
    this.$defs[name] =
      typeof schema === 'function' ? schema.bind(this)() : schema;
    return this as any;
  }

  /**
   * Add a new schema to the stored definitions, for use
   * in local references for a final schema.
   */
  public addDefinitions<NewDefs extends BuilderDefs>(
    newDefs:
      | NewDefs
      | BuilderDefsGenerator<Defs, NewDefs>
      | SchemaBuilder<NewDefs>,
  ): SchemaBuilder<Spread<[Defs, NewDefs]>> {
    const lib =
      typeof newDefs === 'function'
        ? newDefs.bind(this)()
        : newDefs instanceof SchemaBuilder
        ? newDefs.$defs
        : newDefs;
    for (const [name, schema] of Object.entries(lib)) {
      this.addDefinition(name, schema);
    }
    return this as any;
  }

  /**
   * Like JavaScript's `Function.prototype.call()`, except that
   * `this` is already provided as this `SchemaBuilder` instance.
   *
   * This is useful when you want to reference a schema definition
   * created earlier in the chain that Typescript doesn't know about,
   * or when you want to create Schemas within the build-chain when
   * you don't have a variable name to reference.
   *
   * @example
   * ```ts
   * const lib = new SchemaBuilder().addDefinition('aString', function () {
   *   return this.String();
   * });
   *
   * const mySchema = new SchemaBuilder(lib).use(function () {
   *   return this.addDefinition('nums', this.LiteralUnion([1, 2, 3]))
   *     .addDefinition('moreNums', this.Array(this.Number()))
   *     .addDefinition('deeper', function () {
   *       return this.Object({
   *         deepArray: this.Array(this.DefRef('nums')),
   *         libRef: this.Array(this.DefRef('aString')),
   *       });
   *     });
   * });
   * ```
   */
  public use<Out>(func: (this: SchemaBuilder<Defs>) => Out): Out {
    return func.bind(this)();
  }

  /**
   * Add definitions
   */
  public withDefs<
    T extends TSchema,
    N extends '$defs' | 'definitions' = '$defs',
  >(schema: T, fieldName?: N): T & Record<N, Defs> {
    return { ...schema, [fieldName || '$defs']: this.$defs } as any;
  }
}
