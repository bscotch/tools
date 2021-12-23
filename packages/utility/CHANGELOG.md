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
