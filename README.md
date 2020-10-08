# Bscotch Utilities

Utility and helper methods for common programming problems in Node.js.

(These utilities do not work in browsers.)

## Installation

### Requirements

+ Node.js v14+

### Installation

`npm install @bscotch/utility`

## Usage

Typescript:

```ts
// Replace `method` with the desired method name
import {method} from "@bscotch/utility"
```

JavaScript:

```js
// Replace `method` with the desired method name
const {method} = require('@bscotch/utility');
```

### Strings

```ts
import {
  undent,
  oneline
} from '@bscotch/utility';

oneline`
  This string
      will be converted
  into
            one that is
  on a single line.
`;
// => "This string will be converted into one that is on a single line."

undent`
    All lines will
  be un-inindented
      based on the line
    with the smallest indentation.
`;
// =>
//`  All lines will
//be un-inindented
//    based on the line
//  with the smallest indentation.`
```

### Paths

```ts
import {
  toPosixPath,
  sortedPaths,
  parentPaths
} from '@bscotch/utility';

toPosixPath("C:\\hello\\world"); // => "/c/hello/world"
const pathList = [
  'hello/world',
  'hello',
  'h/another',
  'hello/world/goodbye'
];

// Sort paths alphabetically *by directory* which causes
// paths sharing a common parent directory to appear consecutively.
sortedPaths(pathList); // =>
/*
 * [
 *  'hello',
 *  'h/another',
 *  'hello/world',
 *  'hello/world/goodbye'
 * ];
 */

// Get all paths leading to a target path
parentPaths('/hello/world/foo/bar.txt') // =>
/*
 * [
 *  '/',
 *  '/hello',
 *  '/hello/world',
 *  '/hello/world/foo',
 *  '/hello/world/foo/bar.txt'
 * ]
 */

```