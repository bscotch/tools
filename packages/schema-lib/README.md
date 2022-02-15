# `@bscotch/schema-lib`

Library of JSON Schemas, in both JSON Schema and Typescript forms, for re-use in other projects.

**⚠ In early development. Unstable, incomplete, and subject to dramatic change. ⚠**

## JSON Schema + Typescript

JSON Schema is a verbose format, and as such can be difficult to read and write. JSON Schemas are great for run-time data validation, but not particularly useful for typechecking during development.

Typescript types are more concise and have powerful programmatic features, but fewer options for validation/restriction than JSON Schema (e.g. there is no type that can restrict a string's values using a regular expression). Typescript types are great for typechecking during development, but cannot be used for run-time data validation. Further, Typescript types cannot be used by non-Typescript external applications, while JSON Schemas are commonly used by JSON editors, API generators, and other tools.

Having both JSON Schema and Typescript at the same time is ideal, since combined we get all of the following features:

- Documentation
- Validation
- Typechecking
- Tooling portability
- Intellisense

However, for any given data structure we may find that only the Schema, or only the Types are available. For still others, we may have to create both ourselves. To avoid duplicate work, we can use tools that convert Schemas to Types and Types to Schemas, and that can build both at the same time:

- [TypeBox](https://github.com/sinclairzx81/typebox): Create a Schema and corresponding Typescript types *at the same time*. This reduces duplicate effort, and is the basis for `SchemaBuilder`.
- [SchemaBuilder](/packages/schema-builder/README.md): An extension of TypeBox for strong Typescript tooling around creating complex Schemas and their corresponding types.
- [typescript-json-schema](https://www.npmjs.com/package/typescript-json-schema): Create a Schema from Typescript types.
- [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript): Exactly the opposite! Create a Typescript interface from a JSON Schema.
