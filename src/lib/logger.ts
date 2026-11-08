import { AppError } from '@/lib/errors';
export { redact } from '@/lib/telemetry/redact';
export function trace(scope:string,payload?:unknown){
 const started=Date.now();const traceId=globalThis.crypto?.randomUUID?.()||`tsv-${started}`;
 const safeScope=scope.replace(/[^a-zA-Z0-9_.-]/g,'_').slice(0,80);
 const prefix=`[TSV][${safeScope}][${traceId}]`;
 const enabled=process.env.NODE_ENV==='development'||process.env.NEXT_PUBLIC_DEBUG_LOGS==='true';
 let lastStep=0;
 function debug(message:string,data:unknown){
  if(!enabled)return;
  void import('@/lib/telemetry/redact').then(({redact,sanitizeText})=>{console.log(`${prefix} ${sanitizeText(message)}`,redact(data));}).catch(()=>undefined);
 }
 return {
  step(n:number,total:number,message:string,data?:unknown){lastStep=n;debug(`STEP ${n}/${total} ${message}`,data??payload);},
  ok(summary?:unknown){debug(`OK ${Date.now()-started}ms`,summary);},
  fail(error:unknown,extra?:unknown){
   const step=lastStep,elapsed=Date.now()-started;
   // WHY: La redacción y telemetría se cargan solo al fallar; nunca se imprime el error sin sanear.
   void import('@/lib/telemetry/redact').then(({redact})=>{
    console.error(`${prefix} FAIL step=${step} ${elapsed}ms`,redact(error),redact(extra));
    return import('@/lib/telemetry/client').then(({reportClientError})=>reportClientError(error,safeScope,traceId,step));
   }).catch(()=>{console.error(`${prefix} FAIL step=${step}: sanitized details unavailable`);});
   return new AppError('REQUEST_FAILED','Something went wrong. Please try again.',traceId,error);
  },
 };
}
