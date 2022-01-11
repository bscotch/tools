export function createRefObject<Name extends string>(forName: Name) {
  return { $ref: `#/definitions/${forName}` as const };
}
