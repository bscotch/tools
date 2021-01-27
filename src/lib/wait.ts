
/** Get a promise that resolves in some number of milliseconds. */
export function resolveInMillis(millis:number): Promise<void>{
  return new Promise(res=>setTimeout(res,millis));
}

/** Get a promise that resolves in some number of seconds. */
export function resolveInSeconds(seconds:number){
  return resolveInMillis(seconds*1000);
}

export function resolveInNextTick(){
  return new Promise(res=>setImmediate(res));
}

export function wait(millis:number){
  return resolveInMillis(millis);
}