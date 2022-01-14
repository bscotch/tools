import {
  BoxKind,
  CustomOptions,
  RefKind,
  TDefinitions,
  TLiteral,
  TNamespace,
  TRef,
  TSchema,
  TUnion,
  TValue,
  TypeBuilder,
  UnionKind,
} from '@sinclair/typebox';

type ConstUnion<T> = {
  [K in keyof T]: T[K] extends TValue ? TLiteral<T[K]> : never;
};

class TypeBuilderExt extends TypeBuilder {
  protected readonly schemas = new Map<
    string,
    TSchema & Partial<TNamespace<TDefinitions>>
  >();

  /**
   * Create an enum schema from an array of literals,
   * resulting in a union type of those values.
   */
  public ConstUnion<T extends TValue[]>(
    items: [...T],
    options: CustomOptions = {},
  ): TUnion<ConstUnion<T>> {
    return this.Store({ ...options, kind: UnionKind, enum: items });
  }

  public StoreDefinitions<T extends TDefinitions>($defs: T): TNamespace<T> {
    const id = '';
    if (this.schemas.get(id)) {
      $defs = { ...this.schemas.get(id)?.$defs, ...$defs };
    }
    this.schemas.set(id, { kind: BoxKind, $defs } as any);
    return this.schemas.get(id) as any;
  }

  /**
   * For this project I want to use the more understandable
   * {@see StoreDefinitions} method.
   *
   * @deprecated
   */
  public Namespace<T extends TDefinitions>(
    $defs: T,
    options: CustomOptions = {},
  ): never {
    throw new Error('Type.Namespace: Use StoreDefinitions instead');
  }

  /**
   * Reference a Namespace (requirement for the namespace
   * having $id removed).
   */
  public Ref<T extends TNamespace<TDefinitions>, K extends keyof T['$defs']>(
    namespace: T,
    key: K,
  ): TRef<T['$defs'][K]>;

  /**
   * `Standard` References type. The referenced type must
   * specify an `$id`.
   *
   * @note Unchanged from source.
   */
  public Ref<T extends TSchema>(schema: T): TRef<T>;

  public Ref(...args: any[]): any {
    if (args.length === 2) {
      const namespace = args[0] as TNamespace<TDefinitions>;
      const targetKey = args[1] as string;
      const $id = namespace.$id ?? '';
      if (!this.schemas.has($id))
        throw new Error(`Unable to locate namespace with $id '${$id}'`);
      return this.Store({ kind: RefKind, $ref: `${$id}#/$defs/${targetKey}` });
    } else if (args.length === 1) {
      const target = args[0] as any;
      if (target.$id === undefined)
        throw new Error(`Referenced schema has no $id`);
      if (!this.schemas.has(target.$id))
        throw new Error(`Unable to locate schema with $id '${target.$id}'`);
      return this.Store({ kind: RefKind, $ref: target.$id });
    } else {
      throw new Error('Type.Ref: Invalid arguments');
    }
  }

  // /**
  //  * Allow an empty-string $id key, to make incremental building of
  //  * complex schemas more manageable.
  //  *
  //  * @param store - Force stor
  //  */
  // protected Store<
  //   T extends TSchema | TNamespace<TDefinitions>,
  //   S = Omit<T, '$static'>,
  // >(schema: S, forceStore = false): T {
  //   const $schema: any = schema;
  //   if (typeof $schema['$id'] != 'string' && !forceStore) return $schema;
  //   this.schemas.set($schema['$id'] || '', $schema);
  //   return $schema;
  // }

  /**
   * Return a Schema as JSON, including any $defs that are
   * stored on this `TypeBuilderExt` instance that use the `''` $id.
   */
  public Jsonify<T extends TSchema>(schema: T, options: CustomOptions = {}): T {
    const $defs = this.schemas.get('')?.$defs;
    return { ...options, ...schema, $defs } as T;
  }
}

export const Type = new TypeBuilderExt();
