/**
 * @file Extensions to TypeBox for convenience features
 * and specific use-cases.
 */

import {
  TRef,
  TValue,
  RefKind,
  TSchema,
  UnionKind,
  TypeBuilder,
  CustomOptions,
  Static,
} from '@sinclair/typebox';
import { assert, Defined } from '@bscotch/utility';
import Ajv, { Options as AjvOptions, JSONSchemaType } from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import fs, { promises as fsPromises } from 'fs';

export { JSONSchemaType } from 'ajv/dist/2019';
export * from '@sinclair/typebox';

export type StaticRoot<T extends SchemaBuilder<any, any>> =
  T extends SchemaBuilder<any, infer Root>
    ? Root extends undefined
      ? never
      : Static<Defined<Root>>
    : never;

export type StaticDefs<T extends SchemaBuilder<any>> = T extends SchemaBuilder<
  infer U
>
  ? { [K in keyof U]: U[K] extends TSchema ? Static<U[K]> : never }
  : never;

type BuilderDefs = Record<string, TSchema>;

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
export interface TLiteralUnion<T extends TValue[]>
  extends TSchema,
    CustomOptions {
  $static: StaticLiteralUnion<T>;
  kind: typeof UnionKind;
  enum: T;
}

export type SchemaDefRef<Defs extends BuilderDefs> = TRef<Defs[keyof Defs]>;

type SchemaOrDefsKey<Defs extends BuilderDefs> = TSchema | keyof Defs;

/**
 * A new Schema (that may use the definitions from a
 * SchemaBuilder) or an existing Schema (given its
 * definition name).
 */
type SchemaFromBuilder<
  Defs extends BuilderDefs,
  T extends SchemaOrDefsKey<Defs>,
> = T extends TSchema ? T : T extends keyof Defs ? TRef<Defs[T]> : never;

export type SchemaWithDefs<T extends TSchema, Defs extends BuilderDefs> = T & {
  $defs: Defs;
};

export type SchemaFromBuilderWithDefs<
  Defs extends BuilderDefs,
  S extends SchemaOrDefsKey<Defs>,
> = SchemaFromBuilder<Defs, S> & { $defs: Defs };

export interface SchemaBuilderOptions<Defs extends BuilderDefs> {
  /**
   * Optionally initialize the SchemaBuilder using
   * an already-existing collection of schemas,
   * either from another SchemaBuilder or from a
   * plain `{[defName]: schema}` object.
   *
   * This is no different from calling
   * {@link SchemaBuilder.addDefinitions} later.
   */
  lib?: Defs | SchemaBuilder<Defs, any>;
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
export class SchemaBuilder<
  Defs extends BuilderDefs = {},
  Root extends SchemaDefRef<Defs> | undefined = undefined,
> extends TypeBuilder {
  readonly $defs: Defs = {} as Defs;
  protected _root = undefined as Root;

  constructor(options?: SchemaBuilderOptions<Defs>) {
    super();
    if (options?.lib) {
      this.addDefinitions(options.lib);
    }
  }

  get root(): Root {
    return this._root;
  }

  /**
   * Set one of this SchemaBuilder's definitions as the
   * "root" definition, which will cause a `$ref` schema
   * pointing to it to be used as the default output schema.
   */
  public setRoot<N extends keyof Defs>(
    defName: N,
  ): SchemaBuilder<Defs, TRef<Defs[N]>> {
    this._root = this.DefRef(defName) as any;
    return this as any;
  }

  /**
   * Create a `$ref` reference to a schema definition that
   * this `SchemaBuilder` knows about
   * (e.g. it was provided via `addDefinition`).
   *
   * If no `name` argument is provided, returns the root
   * schema (set by {@link setRoot}).
   */
  public DefRef<N extends keyof Defs>(
    name?: N,
  ): N extends undefined
    ? Root extends TSchema
      ? Root
      : never
    : TRef<Defs[N]> {
    if (typeof name === 'undefined') {
      assert(this.root, 'No root schema set');
      return this.root as any;
    }
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

  public findDef<N extends string>(
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
    schema: T | ((this: SchemaBuilder<Defs, Root>) => T),
  ): SchemaBuilder<Defs & Record<N, T>, Root> {
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
      | ((this: SchemaBuilder<Defs, Root>) => NewDefs)
      | SchemaBuilder<NewDefs, any>,
  ): SchemaBuilder<Defs & NewDefs, Root> {
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
   *
   * ```ts
   * const lib = new SchemaBuilder().addDefinition('aString', function () {
   *   return this.String();
   * });
   *
   * const mySchema = new SchemaBuilder(lib)
   *   .use(function () {
   *     return this.addDefinition('nums', this.LiteralUnion([1, 2, 3]))
   *       .addDefinition('moreNums', this.Array(this.Number()))
   *       .addDefinition('deeper', function () {
   *         return this.Object({
   *           deepArray: this.Array(this.DefRef('nums')),
   *           libRef: this.Array(this.DefRef('aString')),
   *         });
   *       });
   *    });
   * ```
   */
  public use<Out>(func: (this: SchemaBuilder<Defs, Root>) => Out): Out {
    return func.bind(this)();
  }

  /**
   * @alias SchemaBuilder.WithDefs
   *
   * Any external functions that attempt to call `toJSON` on
   * objects during serialization (such as `JSON.stringify`)
   * will end up with the serialized root schema.
   */
  public toJSON() {
    return this.WithDefs();
  }

  /**
   * Given a schema, or reference to a schema definition on this
   * instance, return that schema with this builder's definitions
   * added to it.
   *
   * This is typically what you would save to file or use with a
   * validator, if you are not otherwise using convenience functionality
   * provided by {@link SchemaBuilder}.
   */
  public WithDefs(): Root extends undefined ? never : Root & { $defs: Defs };
  public WithDefs<T extends TSchema | undefined>(
    schema?: T,
  ): T extends undefined
    ? Root extends undefined
      ? never
      : Root & { $defs: Defs }
    : T & { $defs: Defs };
  public WithDefs(schema?: any) {
    schema = schema || this.root;
    assert(schema, 'No root schema set');
    return {
      ...schema,
      $defs: this.$defs,
    } as any;
  }
  /**
   * Create an AJV validator for a schema, which will
   * included any defs on this SchemaBuilder and all of
   * the `ajv-formats`. Additional formats, keywords,
   * and other AJV options can be provided via the optional
   * `options` and `extensions` arguments.
   */
  public compileValidator<T extends TSchema>(schema: T, options?: AjvOptions) {
    const ajv = new Ajv(options).addKeyword('kind').addKeyword('modifier');
    addFormats(ajv);

    return ajv.compile(
      this.WithDefs(schema) as unknown as JSONSchemaType<Static<T>>,
    );
  }

  private _write<T extends TSchema, Sync extends boolean>(
    sync: Sync,
    outPath: string,
    schema?: T,
  ): Sync extends true ? void : Promise<void> {
    return (sync ? fs.writeFileSync : fsPromises.writeFile)(
      outPath,
      JSON.stringify(this.WithDefs(schema), null, 2),
    ) as any;
  }

  public async write<T extends TSchema>(outPath: string, schema?: T) {
    await this._write(false, outPath, schema);
    return this;
  }

  public writeSync<T extends TSchema>(outPath: string, schema?: T) {
    this._write(true, outPath, schema);
    return this;
  }
}
