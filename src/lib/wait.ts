export function waitForMillis(millis:number){
  return new Promise(res=>setTimeout(res,millis));
}

export function waitForSeconds(seconds:number){
  return waitForMillis(seconds*1000);
}
