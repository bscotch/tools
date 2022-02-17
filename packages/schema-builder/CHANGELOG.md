# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.1.0-dev.2](https://github.com/bscotch/tools/compare/@bscotch/schema-builder@0.1.0-dev.1...@bscotch/schema-builder@0.1.0-dev.2) (2022-02-17)

**Note:** Version bump only for package @bscotch/schema-builder





# [0.1.0-dev.1](https://github.com/bscotch/tools/compare/@bscotch/schema-builder@0.1.0-dev.0...@bscotch/schema-builder@0.1.0-dev.1) (2022-02-16)


### Bug Fixes

* Move TypeBox override types into src so that they are available when SchemaBuilder is used as an external module. ([e15d92f](https://github.com/bscotch/tools/commit/e15d92fc6cc61e8fb4989cb994123305626bb47b))


### Features

* Change from commonjs to ESM. ([2a88d2e](https://github.com/bscotch/tools/commit/2a88d2e22c14b946bc7df5d661e03af525719b51))
* Replace the TypeBox 'Static' type with one that understands SchemaBuilder instances, and remove now-redundant StaticRoot type. ([aa107c7](https://github.com/bscotch/tools/commit/aa107c7a5c7a567a114df7a8010961f701ff4fcf))
* Update all dependencies. ([7ab0646](https://github.com/bscotch/tools/commit/7ab0646cfd7ddc2d975fcf23835d3ff3dfb1259a))





# 0.1.0-dev.0 (2022-02-12)


### Bug Fixes

* The StaticDefs utility type often returns a 'never' when it shouldn't. ([cd5afd3](https://github.com/bscotch/tools/commit/cd5afd3d1c79a25609d5fdd8bac65958d6b36a1c))


### Features

* Add a method to load data from file, validating it in the process. ([9c4d2dd](https://github.com/bscotch/tools/commit/9c4d2dd72130da8f6c9bd7a4f090ffb9479711ec))
* Add a new package for utilities and tools related to repo management. ([92c7827](https://github.com/bscotch/tools/commit/92c782754cc624e6fc318afe925f55fb06fa3f32))
* Add caching to validation, plus convenience methods for checking data validity against a schema. ([cf4732c](https://github.com/bscotch/tools/commit/cf4732c65fe18d33430380e2d207f69c7d0cfc65))
* Add the concept of a root schema for a builder. ([912ab81](https://github.com/bscotch/tools/commit/912ab81ebad29cc3f2276c103e1c82d0cb6a22a8))
* Add VSCode JSON Schema keywords to the AJV validator instance. ([12f13c4](https://github.com/bscotch/tools/commit/12f13c49bd3e9a0f19902c31d058997bc516b179))
* Change varnames to end with Schema instead of Builder and create Staticroot utility type for getting the root type for a builder instance. ([486be54](https://github.com/bscotch/tools/commit/486be54f970b55543660934ff5520a93e60e4756))
* Extend the Typebox module to include VSCode-specific JSON Schema keywords. ([aee4389](https://github.com/bscotch/tools/commit/aee4389a3be047384f71cd5a9aed330cd3de88c5))
* Move the various schemas from the schema-builder package to a new schema-lib package. ([30accc3](https://github.com/bscotch/tools/commit/30accc30ac028537d8a0db09e52215c0734fae93))
* Remove defaults and coersion from validation. ([29e263f](https://github.com/bscotch/tools/commit/29e263f68b347f3209286258018d66739645d32f))
* Remove extraneous exported types and add more jsdocs. ([4c3f332](https://github.com/bscotch/tools/commit/4c3f332189566a4e71336e0d61c2a01b50e4d9b9))
* Rename schemata to schema-builder since it should be a standalone package. ([3c20a77](https://github.com/bscotch/tools/commit/3c20a77c18c253d79fffcbcf360eb33e898ba14a))
