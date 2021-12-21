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

### Utility Types

```ts
import {
  HttpMethod,
  EmptyArray,
  PartialBy,
  RequiredBy,
  UnwrappedPromise,
  AnyFunction, // Matches any arbitrary function
  Nullish,
  NotNullish,
  NotNull,
  Defined,
  ExtractKeysByValue,
  ExcludeKeysByValue,
  PickByValue,
  OmitByValue,
} from '@bscotch/utility';

const nothingHere: EmptyArray = ["hello"];
// => Typescript Error!

type MixedPartial = PartialBy<{wasRequired:boolean, stillRequired:number},"soonNotRequired">;
// => {wasRequired?: boolean, stillRequired: number}

type PromiseContent = UnwrappedPromise<Promise<"hello">>;
// => yields type "hello"
```

### Strings

```ts
import {
  capitalize,
  decodeFromBase64,
  encodeToBase64,
  decodeFromBase64JsonString,
  encodeToBase64JsonString,
  explode,
  nodent,
  oneline,
  undent,
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

nodent`
    All lines will
be un-inindented
      completely
    but still on separate lines.
`;
// =>
//`All lines will
//be un-inindented
//completely
//but still on separate lines.`

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

### Files

```ts
import {
  listPathsSync,
  listFoldersSync,
  listFilesSync,
  listFilesByExtensionSync,
  removeEmptyDirsSync,
} from '@bscotch/utility';

const recursive = true;

listPathsSync('.',recursive); // => paths to all files and folders in cwd
listFoldersSync('.',recursive); // => the subset of paths that are folders
listFilesSync('.',recursive); // => the subset of paths that are files
listFilesByExtensionSync('.','txt',recursive); // => the subset of files that end with '.txt'
listFilesByExtensionSync('.',['txt','md'],recursive); // => the subset of files that end with '.txt' or '.md'
removeEmptyDirsSync('.'); // Remove all empty directories (recursively)
```

### Waits

```ts
import {
  waitForMillis,
  waitForSeconds,
  waitForTick,
} from '@bscotch/utility';

async myAsynFunction(){
  // Wait for 1 second
  await waitForMillis(1000);
  // Wait for 1 second
  await waitForSeconds(1);
  // Wait until next tick
  await waitForTick();
}
```

### Objects

```ts
import {
  isPlainObject,
  isPlainObjectOrArray,
  asObjectIfArray,
  flattenObjectPaths,
  objectPaths,
  getValueAtPath,
  setValueAtPath,
  objectPathsFromWildcardPath,
  transformValueByPath,
} from '@bscotch/utility';

asObjectIfArray(['hello']); // return {'0':'hello'}
const testObject = {
  hello: 'world',
  nested: {
    layer: 1,
    array: [
      4,
      6,
      7
    ]
  }
}
flattenObjectPaths(testObject); // returns:
/**
 * {
 *  'hello':'world',
 *  'nested.layer': 1,
 *  'nested.array.0': 4,
 *  'nested.array.1': 6,
 *  'nested.array.2': 7,
 * }
 */
objectPaths(testObject); // returns keys from flattenObjectPaths(testObject)
getValueAtPath(testObject,'nested.array.2'); // returns 7
setValueAtPath(testObject,'new.0.field',10); // adds 'new' field to set to [{field:10}]
objectPathsFromWildcardPath('nested.*',testObject); // returns:
// ['nested.layer','nested.array']
objectPathsFromWildcardPath('nested.array.*',testObject); // returns:
// ['nested.array.0','nested.array.1','nested.array.2]
transformValueByPath(testObject,'nested.array.*',n=>++n); // Increments all array values by 1
```

### Crypto

```ts
import {
  md5,
  sha1,
  sha256,
  createHash,
  encrypt,
  decrypt,
} from '@bscotch/utility';

let hash = md5('hello world'); // hex hash
hash = sha256('hello world','base64'); // Base64 hash
hash = createHash('sha1','hello world');

const key = "00000000000000000000000000000000";
const encrypted = encrypt("Hello World",key);
const sourceAsBuffer = decrypt(encrypted,key);
```

### Dates

```ts
import {
  dateSort,
  dateSortDescending,
  dateDifferenceMillis,
  dateDifferenceSeconds,
  dateDifferenceMinutes,
  dateDifferenceHours,
  dateDifferenceDays,
  dateIsGreaterThan,
  dateIsInTheFuture,
  dateIsInThePast,
  dateIsLessThan,
  dateIsOlderThanMillisAgo,
  dateIsOlderThanSecondsAgo,
  dateIsOlderThanMinutesAgo,
  dateIsOlderThanHoursAgo,
  dateIsOlderThanDaysAgo,
  dateIsValid,
  dateAssertIsValid,
} from '@bscotch/utility';
```

### Arrays

```ts
import {
  arrayTouch,
  arrayUntouch,
  arrayEachTruthyComparedToLast,
  arrayValuesAreDecreasing,
  arrayValuesAreIncreasing,
  arraySortNumeric,
  arraySortNumericDescending,
} from '@bscotch/utility';

arrayTouch( "hello" ); // => ["hello"]
arrayTouch(["hello"]); // => ["hello"]
arrayTouch( undefined ); // => []

arrayValuesAreIncreasing([-10,99,1111]); // => true

arrayUntouch( "hello" );           // => "hello"
arrayUntouch(["hello"]);           // => "hello"
arrayUntouch(["hello","goodbye"]); // => "hello"
```