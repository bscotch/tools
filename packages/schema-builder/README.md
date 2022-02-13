# SchemaBuilder (`@bscotch/schema-builder`)

SchemaBuilder is built on top of [TypeBox](https://github.com/sinclairzx81/typebox) to make it easier to build self-contained, complex schemas and reusable schema libraries, with complete Typescript support along the way.

**⚠ In early development. Unstable, incomplete, and subject to dramatic change. ⚠**

## ⚡ Quick Start

See the [TypeBox docs](https://github.com/sinclairzx81/typebox) for the core concepts and features, since SchemaBuilder builds upon those. In particular, this package provides a `SchemaBuilder` class which extends the `TypeBuilder` class from TypeBox (the `Type` export from TypeBox is a `TypeBuilder` instance.)

Install: `npm install @bscotch/schema-builder`

Then build your schema:

```ts
import {
  SchemaBuilder,
  Static,
  StaticDefs
} from '@bscotch/schema-builder';

// SchemaBuilder makes heavy use of chaining, and of using callback
// functions to provide Schemas, so that your `this` type stays
// up to date as you change your SchemaBuilder instance.

// Create a definitions library for re-usability. Related or cross-
// referencing definitions can be collected by a single `SchemaBuilder`
// instance for convenience.
const lib = new SchemaBuilder().addDefinition('aString', function () {
  // By using a callback function, `this` refers to the current
  // SchemaBuilder instance.
  return this.String();
});

// Create a complex schema, starting by importing the definitions
// stored by the `lib` SchemaBuilder instance we just made.
const mySchema = new SchemaBuilder({ lib })
  .use(function () {
    // Using a callback via the `.use()` method lets
    // you use the `this` keyword to refer to the current SchemaBuilder
    // instance, with full type support for any definitions or other
    // changes made to the instance.
    return this.addDefinition('nums', this.LiteralUnion([1, 2, 3]))
      .addDefinition('moreNums', this.Array(this.Number()))
      .addDefinition('deeper', function () {
        return this.Object({
          deepArray: this.Array(this.DefRef('nums')),
          libRef: this.Array(this.DefRef('aString')),
        });
      });
  })
  // Most function return an updated `this`, so that the return type
  // includes changes made to the SchemaBuilder instance.
  .setRoot('deeper');

// Get the root schema as a Typescript interface, which can
// be used for static validation and intellisense.
type MySchema = Static<typeof mySchema>;
// {
//     deepArray: (1|2|3)[];
//     libRef: string[];
// }

// Get the defs library as a Typescript interface
type MySchemaDefs = StaticDefs<typeof mySchema>;
// {
//     aString: string;
//     nums: 2 | 1 | 3;
//     moreNums: StaticArray<TNumber>;
//     deeper: {
//         deepArray: StaticArray<TRef<TLiteralUnion<[1, 2, 3]>>>;
//         libRef: StaticArray<...>;
//     };
// }

// Validate data against the schema
const data: MySchema = {
  deepArray: [2, 3],
  libRef: ['hello']
};

mySchema.assertIsValid(data);

// Save the schema to disk
mySchema.writeSchemaSync('mySchema.json');
```

## What is JSON Schema?

[JSON Schema](https://json-schema.org/) is a specification for describing data structures, and it is incredibly useful for solving several problems simultaneously:

- Data structure description (machine-readable, allows for use of generic solutions for specific data problems)
- Data description/documentation (human-readable)
- Data validation (machine-readable, reduces need for additional test-writing)

By solving this all at the same time, in one place, developers can dramatically reduce the amount of code they need to write and thus reduce errors and increase productivity.

## What problems does `SchemaBuilder` solve?

### Schema authoring is hard and error-prone

JSON Schema is a pain to write since any given schema is *itself* a complex data structure, and JSON Schema has strict rules that schema authors must follow to create valid, useful schemas.

Various tools exist to help with this, including using YAML instead of JSON for better human-readability, intellisense in editors like Visual Studio Code, and various libraries in the JavaScript ecosystem for programmatically creating schemas with varying amounts of Typescript support.

## Prior Art

### Typescript + JSON Schema

Typescript tries to solve many of the same problems that JSON Schema does, at least for JSON-compatible data structures. There are a few libraries that try to use Typescript to infer Schemas or vice versa:

- [TypeBox](https://github.com/sinclairzx81/typebox): Create a Schema and corresponding Typescript types *at the same time*. This reduces duplicate effort, and is the basis for `SchemaBuilder`.
- [typescript-json-schema](https://www.npmjs.com/package/typescript-json-schema): Create a Schema from Typescript types.
- [https://www.npmjs.com/package/json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript): Exactly the opposite! Create a Typescript interface from a JSON Schema.


### Validators

The primary use case for JSON Schema is in building data validators. As such, there are many libraries/modules providing related functionality:

- [ajv](https://ajv.js.org/): Easily the most popular validator. Well tested, with plenty of extended functionality on top of canonical JSON Schema.
- [jsonschema](https://github.com/tdegrunt/jsonschema#readme): A popular validator that still offers significant flexibility for feature extension, including mutation of data during parsing, but is less feature-rich than ajv.
- [z-schema](https://github.com/zaggino/z-schema#readme): Robust and popular validator. Appears to be restricted to JSON Schema spec.
- [json-schema-faker](https://www.npmjs.com/package/json-schema-faker): Generates fake data based on a schema. Useful for testing.

### Parsers & Serializers

JSON Schemas describe data, and so can be used to programmatically parse and serialize corresponding data.

- [fast-json-stringify](https://www.npmjs.com/package/fast-json-stringify): A JSON stringifier that makes use of a corresponding JSON Schema to precompile a stringifier that is much faster than the general `JSON.stringify` function.


### Misc. Schema tools

JSON Schemas can be difficult to create and understand, and there are various tools out there for simplifying their use:

- [json-schema-traverse](https://www.npmjs.com/package/json-schema-traverse): Call functions on each subschema of a JSON Schema.
- [json-schema-ref-parser](https://www.npmjs.com/package/json-schema-ref-parser): Utilities for de-referencing `$ref`s in JSON Schemas, including the ability to convert such a schema into one with internal references.

