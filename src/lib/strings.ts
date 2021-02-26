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
 */
export function undent(strings: TemplateStringsArray, ...interps: any[]) {
  let string = populateTemplate(strings, ...interps);
  // Remove initial and final newlines
  string = string.replace(/^[\r\n]+/, '').replace(/\s+$/, '');
  const dents = string.match(/^([ \t])*/gm);
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

export const strings = {
  decodeFromBase64,
  encodeToBase64,
  decodeFromBase64JsonString,
  encodeToBase64JsonString,
  nodent,
  oneline,
  undent,
};
