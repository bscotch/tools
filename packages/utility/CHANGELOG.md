# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/bscotch/tools/compare/@bscotch/utility@3.1.0...@bscotch/utility@4.0.0) (2022-02-17)


### Bug Fixes

* An import has an invalid path, causing a runtime error. ([9e97f8e](https://github.com/bscotch/tools/commit/9e97f8ef02dc3a02073450fe89060127d03294f6))
* Typeguard methods for arrays are defined and exported twice. ([9354883](https://github.com/bscotch/tools/commit/935488322a764b74fbf059e9a013606819123c56))


### Features

* Add a non-empty array utility type. ([fb03d79](https://github.com/bscotch/tools/commit/fb03d7936c7af85ddb051bdde49bc4013bf8da42))
* Add type-guard functions for e.g. 'isBoolean', 'isNonEmptyArray', etc. ([7c20bd6](https://github.com/bscotch/tools/commit/7c20bd6433f9f31eece8d31939c0e5a5fe5e61d5))
* Remove 'dates' object export from date-related methods. ([0af9406](https://github.com/bscotch/tools/commit/0af9406779876ee84ea2bc56d7fb06c90092a7d6))


### BREAKING CHANGES

* Exported 'dates' object no longer available. This
object bundled together date-related functions, which mostly just adds
confusing overhead.





# [3.1.0](https://github.com/bscotch/tools/compare/@bscotch/utility@3.0.0...@bscotch/utility@3.1.0) (2022-02-16)


### Features

* Add 'keyOf' function for getting an object keys with full type ([b070d69](https://github.com/bscotch/tools/commit/b070d69c8c9dc186cc77e3cf9a626d6279146dd0))
* Add 'TupleOf' utility type. ([599746e](https://github.com/bscotch/tools/commit/599746e3c4a9a886a87f939fabb01294e0b961ec))





# 3.0.0 (2022-02-12)


* feat!: Add random string generation and remove default export from crypto lib. ([758086a](https://github.com/bscotch/utility/commit/758086a882ec0009213515d9dc2753b0e1a62be5))


### Features

* Change JsonSchema type to be less fragile with optional fields and enums. ([39881ea](https://github.com/bscotch/utility/commit/39881eae3e6efa94d47f916fd662fce7c0103e7f))
* Create separate SchemaBuilder class to cleanly separate TypeBox from these extended features. ([9238eb8](https://github.com/bscotch/utility/commit/9238eb8461b015c6b864d605008a9f5a6cc6eef1))
* Draft Project and Package base classes for Informer. ([0b471ba](https://github.com/bscotch/utility/commit/0b471bac23cfd78f8b6fd58286009141e232f229))
* Move the various schemas from the schema-builder package to a new schema-lib package. ([30accc3](https://github.com/bscotch/utility/commit/30accc30ac028537d8a0db09e52215c0734fae93))


### BREAKING CHANGES

* A 'crypto' object containing crypto functions is no
longer exported. All functions are exported independently as named
exports.
* Crypto function 'createHash' renamed to 'hash' for
easier discoverability.





# [2.2.0](https://github.com/bscotch/node-util/compare/v2.1.1...v2.2.0) (2021-12-17)

### Features

* Add functions for converting data into ESM modules. ([28c8b9d](https://github.com/bscotch/node-util/commit/28c8b9dc69b6d7d06872938d4b02695390688d21))

## [2.1.1](https://github.com/bscotch/node-util/compare/v2.1.0...v2.1.1) (2021-12-07)

### Bug Fixes

* A 'wait' test began to fail because it was fragile. ([eefe2b8](https://github.com/bscotch/node-util/commit/eefe2b84fe297da7c95ade957c28458d6c656535))
* The isPlainObject and similar functions have insufficient types. ([a56240c](https://github.com/bscotch/node-util/commit/a56240c37a60d9f11cde20d6476a6bb3dea543cf))
* The scripts in the package.json are not updated for the new automated versioning workflow. ([5c2d714](https://github.com/bscotch/node-util/commit/5c2d71411735e58dff239f0f621b7f33fdc2f544))
* The types for dateIsValid and the corresponding assertion are not making use of type guards. ([3e33017](https://github.com/bscotch/node-util/commit/3e33017700730da3c56256f98903770763bf50b9))
* The wait-tests are fragile -- add a little wiggle room. ([803858c](https://github.com/bscotch/node-util/commit/803858c9c6db9ab51646066745aa3aaea39c12cd))

# [2.1.0](https://github.com/bscotch/node-util/compare/v2.0.0...v2.1.0) (2021-06-04)

### Features

* Update all deps. ([37622d7](https://github.com/bscotch/node-util/commit/37622d7ae6fccb865db8c8bd258622d08fea8710))

# [2.0.0](https://github.com/bscotch/node-util/compare/v1.1.2...v2.0.0) (2021-06-04)

### Features

* Change the 'undent' template function to handle interpolated values that have newlines inside them. There's no one-size-fits-all solution here, but having interped values inherit the indent level of the line they start on is a decent solution. BREAKING. ([bdfa7e7](https://github.com/bscotch/node-util/commit/bdfa7e76d6e8f847e7bf44adba684eb3957193fe))
