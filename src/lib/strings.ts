import { BscotchUtilError } from './errors';

function populateTemplate(strings: TemplateStringsArray, ...interps: any[]) {
  let string = '';
  for (let i = 0; i < strings.length; i++) {
    string += `${strings[i] || ''}${interps[i] || ''}`;
  }
  return string;
}

/**
 * Shift all lines left by the *smallest* indentation level,
 * and remove initial newline and all trailing spaces.
 * Does not take into account indentation on lines that only
 * have spaces.
 */
export function undent(strings: TemplateStringsArray, ...interps: any[]) {
  let string = populateTemplate(strings, ...interps);
  // Remove initial and final newlines
  string = string.replace(/^[\r\n]+/, '').replace(/\s+$/, '');
  // Find all indentations *on lines that are not just whitespace!*
  const indentRegex = /^(?<indent>[ \t]*)(?<nonSpace>[^\s])?/;
  const dents: string[] | null = string
    .match(new RegExp(indentRegex, 'gm'))
    ?.map((dentedLine): string | undefined => {
      const { indent, nonSpace } = dentedLine.match(indentRegex)!.groups as {
        indent?: string;
        nonSpace?: string;
      };
      const isNotJustWhitespace = nonSpace?.length;
      if (isNotJustWhitespace) {
        return indent || '';
      }
      return;
    })
    .filter((indentLevel) => typeof indentLevel == 'string') as string[];
  if (!dents || dents.length == 0) {
    return string;
  }
  dents.sort((dent1, dent2) => dent1.length - dent2.length);
  const minDent = dents[0];
  if (!minDent) {
    // Then min indentation is 0, no change needed
    return string;
  }
  const dedented = string.replace(new RegExp(`^${minDent}`, 'gm'), '');
  return dedented;
}

/**
 * Remove ALL indents, from every line.
 */
export function nodent(strings: TemplateStringsArray, ...interps: any[]) {
  let string = populateTemplate(strings, ...interps);
  // Remove initial and final newlines
  string = string.replace(/^[\r\n]+/, '').replace(/\s+$/, '');
  return string
    .split(/\r?\n/g)
    .map((line) => line.replace(/^\s*(.*?)/, '$1'))
    .join('\n');
}

/**
 * Remove linebreaks and extra spacing in a template string.
 */
export function oneline(strings: TemplateStringsArray, ...interps: any[]) {
  return populateTemplate(strings, ...interps)
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\s+/g, ' ');
}

export function encodeToBase64(content: string | Buffer) {
  return (Buffer.isBuffer(content) ? content : Buffer.from(content)).toString(
    'base64',
  );
}

export function decodeFromBase64(base64: string) {
  return Buffer.from(base64, 'base64').toString();
}

export function decodeFromBase64JsonString(string: string) {
  try {
    return JSON.parse(decodeFromBase64(string));
  } catch {
    throw new BscotchUtilError('Object is not JSON parseable');
  }
}

export function encodeToBase64JsonString(something: any) {
  try {
    return encodeToBase64(JSON.stringify(something));
  } catch {
    throw new BscotchUtilError('Object is not JSON stringifiable');
  }
}

export function capitalize(string: string) {
  return `${string}`.charAt(0).toLocaleUpperCase() + `${string}`.slice(1);
}

/**
 * Explode a string using a separator.
 */
export function explode(
  string?: string,
  options?: {
    /** Only return first `limit` results (returns all by default) */
    limit?: number | null;
    /** Separator to explode on */
    sep?: string | RegExp;
    /** Nullstrings are skipped unless this is set to `true` */
    keepEmpty?: boolean;
    /** If `true`, only unique values returned (order not guaranteed) */
    unique?: boolean;
    /** By default the original string and all values are trimmed.
     * Set to `true` to prevent this behavior.
     */
    noTrim?: boolean;
  },
) {
  options ||= {};
  options.sep = typeof options.sep == 'undefined' ? /\s*,\s*/ : options.sep;
  if (!string || typeof string != 'string' || options.limit === 0) {
    return [];
  }
  let entries = string[options?.noTrim ? 'toString' : 'trim']()
    .split(options.sep)
    .map((entry) => (options?.noTrim ? entry : entry.trim()))
    .filter((entry) => entry || options?.keepEmpty);
  entries = entries.slice(0, options.limit || entries.length);
  return options.unique ? [...new Set(entries)] : entries;
}

export const strings = {
  capitalize,
  decodeFromBase64,
  decodeFromBase64JsonString,
  encodeToBase64,
  encodeToBase64JsonString,
  explode,
  nodent,
  oneline,
  undent,
};
