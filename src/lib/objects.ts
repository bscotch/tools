import { assert } from "./errors";

export function isPlainObject(something:any){
  return something &&
    typeof something == 'object' &&
      (
        !something.toString ||
        something.toString?.()=='[object Object]'
      );
}

export function isPlainObjectOrArray(something:any){
  return Array.isArray(something) || isPlainObject(something);
}

/**
 * Convert an array into objects that use numeric
 * strings as indices. Non-array items are return as-is.
 */
export function asObjectIfArray(array:any[]){
  if(!Array.isArray(array)){
    return array;
  }
  return array.reduce((asMap,value,index)=>{
    asMap[`${index}`] = value;
    return asMap;
  },{} as {[key:string]:any});
}

/**
 * Flatten a nested data structure into a one-level-deep
 * map, with keys as paths like "firstLevel.secondLevel.0.3".
 * It's assumed that object keys are not castable as numbers,
 * so that all numeric parts of the path are unambiguously from
 * arrays.
 */
export function flattenObjectPaths(object:any){
  if(!isPlainObjectOrArray(object)){
    return object;
  }
  // Make a shallow clone.
  object = Array.isArray(object) ? [...object] : {...object};
  const toReturn:{[key:string]:any} = {};
  for (const key of Object.keys(object)){
    assert(!key.includes('.'),'Keys must not have periods in them.');
    object[key] = asObjectIfArray(object[key]);
    // Convert arrays to objects
    if( isPlainObject(object[key])) {
      const flatObject = flattenObjectPaths(object[key]);
      for (const subkey of Object.keys(flatObject)){
        toReturn[`${key}.${subkey}`] = flatObject[subkey];
      }
    }
    else {
      toReturn[key] = object[key];
    }
  }
  return toReturn;
}

export function objectPaths(object:any){
  const flattened = flattenObjectPaths(object);
  if(!isPlainObject(flattened)){
    return [];
  }
  return Object.keys(flattened);
}

/** Get the value at a fully defined (no wildcards) path. */
export function getValueAtPath(object:any,path:string){
  const pathParts = path.split('.');
  let subObject = object;
  for(const part of pathParts){
    subObject = subObject?.[part];
    if(!subObject){ return; }
  }
  return subObject;
}

/**
 * Set the value at a fully defined (no wildcards) path.
 * Any missing data structures will be added.
*/
export function setValueAtPath(object:any,path:string,value:any){
  const pathParts = path.split('.');
  let subObject = object;
  for(let level=0; level<pathParts.length-1; level++){
    const index = pathParts[level].match(/^\d+$/)
      ? Number(pathParts[level])
      : pathParts[level];
    if(typeof subObject[index] == 'undefined'){
      subObject[index] = typeof index == 'number' ? [] : {};
    }
    subObject = subObject[index];
  }
  subObject[pathParts[pathParts.length-1]] = value;
}

/**
 * Given an object path that *may* include wildcards
 * (e.g. `a.*.b`), get all paths that match. Assumes
 * that path components do not include regex special
 * characters (except '.' and '*');
 */

export function objectPathsFromWildcardPath (path:string,object:any){
  const allPaths = objectPaths(object);
  const pathAsRegex = new RegExp(`^(${path.replace(/\./,'\\.').replace(/\*/g,'[^.]+')})(\\.|$)`);
  const matches = allPaths.map(path=>path.match(pathAsRegex)?.[1])
    .filter(x=>x);
  return [...new Set(matches)] as string[]; // ensure unique
}

type Transformer = (value:any)=>any;

/**
 * Apply a function to a value inside an object,
 * using a path string for complex data structures.
 * Allows using `*` to mean *all* fields.
 * For example, `a.b.3.*`, for structure
 * `{a:{b:[0,1,{c:'hello',d:'world'}]}}`
 * would capture paths `a.b.3.c` and `a.b.3.d`
 * and apply the transform to both values.
 * If a path does not exist, no action is taken.
 * @param {boolean} [addMissing] If true, fields matching the path that don't exist
 * will still be passed to the transformer, and the resulting value will be added
 * to the data structure.
 */
export function transformValueByPath(object:{[key:string]:any}|any[],path:string,transformer:Transformer){
  if(!isPlainObjectOrArray(object)){
    return object;
  }
  const paths = objectPathsFromWildcardPath(path,object);
  for(const subpath of paths){
    const value = getValueAtPath(object,subpath);
    setValueAtPath(object,subpath,transformer(value));
  }
  return object;
}
