/**
 * @file Extensions to TypeBox for convenience features
 * and specific use-cases.
 */

import { ArrayOrScalar, assert, wrapIfNotArray } from '@bscotch/utility';
import { RefKind, TRef, TSchema } from '@sinclair/typebox';
import { TypeBuilderExtended } from './typeboxExtended.js';

type BuilderDefs = Record<string, TSchema>;

type BuilderWithDefs<
  OldDefs extends BuilderDefs,
  NewDefs extends BuilderDefs,
> = SchemaBuilder<OldDefs & NewDefs>;

type SchemaBuilderDefGenerator<
  OldDefs extends BuilderDefs,
  T extends TSchema,
> = (this: SchemaBuilder<OldDefs>) => T;

type SchemaBuilderDefsGenerator<
  OldDefs extends BuilderDefs,
  NewDefs extends BuilderDefs,
> = (this: SchemaBuilder<OldDefs>) => NewDefs;

/**
 * A `SchemaBuilder` instance provides storage for schema
 * definitions (for use in `$ref`s) and for creating a Schema
 * that uses them, all with full Typescript support.
 *
 * The API is designed to enable
 *
 * (Powered by TypeBox)
 */
export class SchemaBuilder<Defs extends BuilderDefs> {
  protected readonly $defs: Defs = {} as Defs;

  constructor($defs?: ArrayOrScalar<Defs>) {
    if ($defs) {
      this.addDefinitions($defs);
    }
  }

  /**
   * An extended TypeBox `TypeBuilder` instance for creating schemas.
   */
  readonly Type = new TypeBuilderExtended<Defs>();

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
    schema: T | SchemaBuilderDefGenerator<Defs, T>,
  ): SchemaBuilder<Defs & Record<N, T>> {
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
    lib: ArrayOrScalar<NewDefs>,
  ): BuilderWithDefs<Defs, NewDefs>;
  public addDefinitions<NewDefs extends BuilderDefs>(
    newDefs: NewDefs | SchemaBuilderDefsGenerator<Defs, NewDefs>,
  ): BuilderWithDefs<Defs, NewDefs>;
  public addDefinitions<NewDefs extends BuilderDefs>(
    newDefs: ArrayOrScalar<NewDefs> | SchemaBuilderDefsGenerator<Defs, NewDefs>,
  ): BuilderWithDefs<Defs, NewDefs> {
    const libs = typeof newDefs === 'function' ? newDefs.bind(this)() : newDefs;
    for (const lib of wrapIfNotArray(libs)) {
      for (const [name, schema] of Object.entries(lib)) {
        this.addDefinition(name, schema);
      }
    }
    return this as any;
  }

  public DefRef<N extends keyof Defs>(name: N): TRef<Defs[N]> {
    this.assertDefExists(name as string);
    return { kind: RefKind, $ref: `#/$defs/${name}` } as any;
  }

  static create<
    Defs extends BuilderDefs,
    OldDefs extends BuilderDefs,
    Libs extends SchemaBuilder<OldDefs>[],
  >(
    libs: Libs,
    generator?: (this: SchemaBuilder<OldDefs>) => SchemaBuilder<Defs>,
  ): BuilderWithDefs<OldDefs, Defs>;
  static create<Defs extends BuilderDefs>(
    generator: (this: SchemaBuilder<{}>) => SchemaBuilder<Defs>,
  ): SchemaBuilder<Defs>;
  static create<
    Defs extends BuilderDefs,
    OldDefs extends BuilderDefs,
    Libs extends SchemaBuilder<OldDefs>[],
  >(
    libsOrGenerator: Libs | ((this: SchemaBuilder<{}>) => SchemaBuilder<Defs>),
    generator?: (this: SchemaBuilder<{}>) => SchemaBuilder<Defs>,
  ): any {
    const builder = new SchemaBuilder();
    const libs = Array.isArray(libsOrGenerator) ? libsOrGenerator : [];
    generator =
      typeof libsOrGenerator == 'function' ? libsOrGenerator : generator;
    for (const lib of libs) {
      builder.addDefinitions(lib.$defs);
    }
    return generator?.bind(builder)() || builder;
  }
}

const meh = SchemaBuilder.create(function () {
  return this.addDefinition('nums', this.Type.LiteralUnion([1, 2, 3]))
    .addDefinition('moreNums', this.Type.Array(this.Type.Number()))
    .addDefinition('deeper', function () {
      return this.Type.Object({
        deepArray: this.Type.Array(this.DefRef('moreNums')),
      });
    });
});
