import path from 'path';
import PrettyError from 'pretty-error';

const pe = new PrettyError().start();

interface TraceLine {
  /**
   * The raw line of the stack trace.
   */
  original: string;
  /**
   * The thing throwing the error?
   */
  what: string;
  /**
   * The full, absolute path + line number + column number
   */
  addr: string;
  /**
   * The full, absolute path without the line/col numbers
   */
  path: string;
  /**
   * The full, absolute path to the dir containing the file
   */
  dir: string;
  file: string;
  line: number;
  col: number;
  /**
   * The name of the package throwing the error,
   * defaulting to `[current]`.
   */
  packageName: string;
  /**
   * Abbreviated path that gets printed
   */
  shortenedPath: string;
  /**
   * Abbreviated addr that gets printed
   */
  shortenedAddr: string;
}

const root = path.resolve(process.cwd(), '..').replace(/\\+/g, '/');

function getRelativePath(toPath: string) {
  if (!toPath.startsWith(root)) {
    return toPath;
  }
  return path.join('.', path.relative(root, toPath));
}

pe.skipPackage('mocha', 'chai');

pe.skip((traceLine: TraceLine, traceIndex: number) => {
  if (!traceLine?.file) {
    return true;
  }
  // Skip internals
  if (traceLine.addr.match(/^node\b/)) {
    return true;
  }
  return false;
});

pe.filter((traceLine: TraceLine, traceIndex: number) => {
  // Mutate paths
  traceLine.shortenedPath = getRelativePath(traceLine.shortenedPath);
  traceLine.shortenedAddr = getRelativePath(traceLine.shortenedAddr);
  traceLine.what = `🔥 ${traceLine.what}`.replace(
    'Context.<anonymous>',
    '<anonymous>',
  );
  return true;
});

/**
 * Override default styling
 * {@link https://github.com/AriaMinaei/pretty-error/blob/master/src/defaultStyle.coffee}
 */
pe.appendStyle({
  'pretty-error': {
    display: 'block',
    marginLeft: 0,
  },
  'pretty-error > header': {
    display: 'block',
    marginTop: 1,
  },
  'pretty-error > header > message': {
    color: 'red',
  },
  'pretty-error > header > title > kind': {
    background: 'red',
    color: 'black',
    paddingLeft: 1,
    paddingRight: 1,
  },
  'pretty-error > trace': {
    display: 'block',
    marginTop: 0,
  },
  'pretty-error > trace > item': {
    display: 'block',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 1,
    bullet: '',
  },
  'pretty-error > trace > item > footer': {
    color: 'cyan',
    marginLeft: 3,
  },
  'pretty-error > trace > item > footer > addr': {
    color: 'cyan',
    marginLeft: 2,
    bullet: '"› "',
  },
  'pretty-error > trace > item > header > pointer > file': {
    display: 'none',
  },
  'pretty-error > trace > item > header > pointer > colon': {
    display: 'none',
  },
  'pretty-error > trace > item > header > pointer > line': {
    display: 'none',
  },
});
