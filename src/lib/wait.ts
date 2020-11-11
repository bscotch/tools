/** Get a promise that resolves in some number of milliseconds. */
export function resolveInMillis(millis:number){
  return new Promise(res=>setTimeout(res,millis));
}

/** Get a promise that resolves in some number of seconds. */
export function resolveInSeconds(seconds:number){
  return resolveInMillis(seconds*1000);
}
