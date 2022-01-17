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
import { assert } from '@bscotch/utility';
import Ajv, { Options as AjvOptions, JSONSchemaType } from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import fs, { promises as fsPromises } from 'fs';

export { JSONSchemaType } from 'ajv/dist/2019';
export * from '@sinclair/typebox';

export type StaticDefs<T extends SchemaBuilder<any>> = T extends SchemaBuilder<
  infer U
>
  ? { [K in keyof U]: U[K] extends TSchema ? Static<U[K]> : never }
  : never;

type BuilderRoot = TSchema | undefined;

type BuilderDefs = Record<string, TSchema>;

type BuilderDefGenerator<
  OldDefs extends BuilderDefs,
  T extends TSchema,
  Root extends BuilderRoot = undefined,
> = (this: SchemaBuilder<OldDefs, Root>) => T;

type BuilderDefsGenerator<
  OldDefs extends BuilderDefs,
  NewDefs extends BuilderDefs,
  Root extends BuilderRoot = undefined,
> = (this: SchemaBuilder<OldDefs, Root>) => NewDefs;

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

export type SchemaDefsField = '$defs' | 'definitions';

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

export type SchemaFromBuilderWithDefs<
  Defs extends BuilderDefs,
  S extends SchemaOrDefsKey<Defs>,
  N extends SchemaDefsField = '$defs',
> = SchemaFromBuilder<Defs, S> & Record<N, Defs>;

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
  Root extends TSchema | undefined = undefined,
> extends TypeBuilder {
  readonly $defs: Defs = {} as Defs;
  protected readonly root = undefined as Root;

  constructor($defs?: Defs | SchemaBuilder<Defs>) {
    super();

    if ($defs) {
      this.addDefinitions($defs);
    }
  }

  /**
   * Normalize an incoming schema or definition name
   * to a schema.
   */
  private _asSchema<T extends SchemaOrDefsKey<Defs>>(
    schemaOrDefsKey: T,
  ): SchemaFromBuilder<Defs, T> {
    const defName = typeof schemaOrDefsKey === 'string' && schemaOrDefsKey;
    const schema = defName
      ? this.DefRef(defName)
      : (schemaOrDefsKey as TSchema);
    return schema as any;
  }

  /**
   *
   * TODO: FINISH THIS API
   *
   * Get the current Root schema (or undefined, if not set).
   * Provide a root schema or definition name as the argument
   * to set the root.
   */
  public Root(): Root;
  /**
   * Set the root schema, for use in default behaviors.
   * This is particularly useful
   */
  public Root<T extends SchemaOrDefsKey<Defs>>(
    schemaOrDefsKey: T,
  ): SchemaFromBuilder<Defs, T>;
  public Root<T extends SchemaOrDefsKey<Defs>>(schemaOrDefsKey?: T) {
    if (!schemaOrDefsKey) {
      return this.root;
    }
    return this._asSchema(schemaOrDefsKey);
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
    schema: T | BuilderDefGenerator<Defs, T, Root>,
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
      | BuilderDefsGenerator<Defs, NewDefs, Root>
      | SchemaBuilder<NewDefs>,
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
   * Add definitions from this SchemaBuilder instance to a Schema
   */
  public WithDefs<
    T extends SchemaOrDefsKey<Defs>,
    N extends SchemaDefsField = '$defs',
  >(schemaOrDefsKey: T, fieldName?: N): SchemaFromBuilderWithDefs<Defs, T, N> {
    const defName = typeof schemaOrDefsKey === 'string' && schemaOrDefsKey;
    const schema = defName
      ? this.DefRef(defName)
      : (schemaOrDefsKey as TSchema);
    return {
      ...schema,
      [fieldName || '$defs']: this.$defs,
    } as any;
  }

  private _write<T extends TSchema, Sync extends boolean>(
    sync: Sync,
    schema: T,
    outPath: string,
  ): Sync extends true ? void : Promise<void> {
    return (sync ? fs.writeFileSync : fsPromises.writeFile)(
      outPath,
      JSON.stringify(this.WithDefs(schema), null, 2),
    ) as any;
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

  public async write<T extends TSchema>(
    schema: T,
    outPath: string,
  ): Promise<SchemaBuilder<Defs, Root>> {
    await this._write(false, schema, outPath);
    return this;
  }

  public writeSync<T extends TSchema>(
    schema: T,
    outPath: string,
  ): SchemaBuilder<Defs, Root> {
    this._write(true, schema, outPath);
    return this;
  }
}
