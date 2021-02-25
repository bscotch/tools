# [0.12.0](https://github.com/bscotch/node-util/compare/v0.11.1...v0.12.0) (2021-02-25)


### Features

* Add a 'nodent' tagged template to remove all indentation from a multiline string. ([4029137](https://github.com/bscotch/node-util/commit/4029137ca5ba237e3268dfe2d5789fc78470f427))



## [0.11.1](https://github.com/bscotch/node-util/compare/v0.11.0...v0.11.1) (2021-02-24)


### Bug Fixes

* The interpolated values for tagged templates are typed as strings instead of 'any'. ([5f1d2dc](https://github.com/bscotch/node-util/commit/5f1d2dc8d5e1255bc99b8a0a1ddcca279478f6b3))



# [0.11.0](https://github.com/bscotch/node-util/compare/v0.10.0...v0.11.0) (2021-01-27)


### Features

* Add simple encrypt/decrypt functions. ([9887240](https://github.com/bscotch/node-util/commit/98872409d5cd87667ba116f0a9c9173014da5019))



# [0.10.0](https://github.com/bscotch/node-util/compare/v0.9.1...v0.10.0) (2021-01-27)



## [0.9.1](https://github.com/bscotch/node-util/compare/v0.9.0...v0.9.1) (2020-12-16)


### Bug Fixes

* Types for the crypto node module have a breaking change. ([e93a91a](https://github.com/bscotch/node-util/commit/e93a91a684747ce7de67601c869ff6536b1da2bd))



# [0.9.0](https://github.com/bscotch/node-util/compare/v0.8.3...v0.9.0) (2020-12-16)


### Features

* Add misc. date functions, mostly for comparing dates. ([2346417](https://github.com/bscotch/node-util/commit/2346417b57d7a44cf9d48363b6d15f003c7e90f2))



## [0.8.3](https://github.com/bscotch/node-util/compare/v0.8.2...v0.8.3) (2020-12-16)



## [0.8.2](https://github.com/bscotch/node-util/compare/v0.8.1...v0.8.2) (2020-11-27)


### Features

* Simple hashing functions added (md5, sha1, sha256, choose-your-own-adventure). ([56b49ce](https://github.com/bscotch/node-util/commit/56b49cedfd387928b45a2056450bcec2a1859ad5))



## [0.8.1](https://github.com/bscotch/node-util/compare/v0.8.0...v0.8.1) (2020-11-17)


### Bug Fixes

* isPlainObject now returns true for objects without a toString() function. ([412c697](https://github.com/bscotch/node-util/commit/412c697fd9e9052512dd20763e9a084d91b1c615))



# [0.8.0](https://github.com/bscotch/node-util/compare/v0.7.1...v0.8.0) (2020-11-17)


### Features

* Object path and related functions added. ([6ebcd72](https://github.com/bscotch/node-util/commit/6ebcd727bb86be26373caf4834e6247975590b40))



## [0.7.1](https://github.com/bscotch/node-util/compare/v0.7.0...v0.7.1) (2020-11-12)


### Bug Fixes

* resolveInNextTick no longer uses nextTick, instead using setImmediate, which works as intended. ([a3d8dc0](https://github.com/bscotch/node-util/commit/a3d8dc0523a659578e9a66445bd9980c895c209a))



# [0.7.0](https://github.com/bscotch/node-util/compare/v0.6.0...v0.7.0) (2020-11-11)


### Features

* Can now get a promise that resolves after one tick. ([157e280](https://github.com/bscotch/node-util/commit/157e280960ebe11546d27847b36dec15e72f8a7a))



# [0.6.0](https://github.com/bscotch/node-util/compare/v0.5.2...v0.6.0) (2020-11-11)


### Features

* Rename wait methods to 'resolveInSeconds' etc to be more explicit about what's happening. ([df5c6ab](https://github.com/bscotch/node-util/commit/df5c6abd41c4c60587e26d4a8e9f3fde04c67cea))



## [0.5.2](https://github.com/bscotch/node-util/compare/v0.5.1...v0.5.2) (2020-11-11)


### Features

* Add async 'wait' functions, for delaying progression until a timer has expired. ([2ee8810](https://github.com/bscotch/node-util/commit/2ee8810e0de36a562a40fcd0926e02760bc1abb1))



## [0.5.1](https://github.com/bscotch/node-util/compare/v0.5.0...v0.5.1) (2020-10-15)


### Bug Fixes

* Recursively removing empty directories now works. Previously it would remove *some* directories and never the root one. ([c3daaf0](https://github.com/bscotch/node-util/commit/c3daaf06330e0d9a7d2c1f61ad5adcbee846bdf0))



# [0.5.0](https://github.com/bscotch/node-util/compare/v0.4.0...v0.5.0) (2020-10-12)


### Features

* Add method for finding and deleting empty folders. ([386b32d](https://github.com/bscotch/node-util/commit/386b32dac671386a931dd837bb08d70c78e53e35))



# [0.4.0](https://github.com/bscotch/node-util/compare/v0.3.1...v0.4.0) (2020-10-12)


### Features

* When listing files/folders in a directory, will now return an empty array for non-existent paths instead of throwing an error. ([8fe2a5c](https://github.com/bscotch/node-util/commit/8fe2a5cad9b59f4ba64549874670bc238d4149c7))



## [0.3.1](https://github.com/bscotch/node-util/compare/v0.3.0...v0.3.1) (2020-10-12)


### Bug Fixes

* Listing paths/folders/files should now properly exclude .git and node_modules folders. ([6f463da](https://github.com/bscotch/node-util/commit/6f463da1630cf0dea518c4659ca7e6316b70e65a))



# [0.3.0](https://github.com/bscotch/node-util/compare/v0.2.1...v0.3.0) (2020-10-08)


### Features

* Have path listing methods ignore .git and node_modules folders by default ([58aead5](https://github.com/bscotch/node-util/commit/58aead5f9afaa596a6569aa68962abf2253daabc))



## [0.2.1](https://github.com/bscotch/node-util/compare/v0.2.0...v0.2.1) (2020-10-08)



# [0.2.0](https://github.com/bscotch/node-util/compare/v0.1.0...v0.2.0) (2020-10-08)


### Features

* Add methods for listing folders and files (with optional recursion) ([6d516cb](https://github.com/bscotch/node-util/commit/6d516cb786dc5e53f674f5b71353a21cc12407d6))



# [0.1.0](https://github.com/bscotch/node-util/compare/d1264e78319521c9667206330a9aaa36fa82e1a5...v0.1.0) (2020-10-08)


### Features

* Add 'undent' and 'oneline' template string methods ([fa7ceab](https://github.com/bscotch/node-util/commit/fa7ceab3eb92a07fadeb14947622425183e5c85e))
* Add paths utilities for forcing to posix separators, sorting by directory, and fetching all parent paths leading to a target path. ([3397402](https://github.com/bscotch/node-util/commit/33974024df9ab43dac4d40b25555eb9f88467921))
* Initalize repo with typescript skeleton ([d1264e7](https://github.com/bscotch/node-util/commit/d1264e78319521c9667206330a9aaa36fa82e1a5))



