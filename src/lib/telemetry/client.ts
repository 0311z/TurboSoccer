import { sanitizeText } from './redact';
let initialized:Promise<void>|null=null;
export async function initializeTelemetry():Promise<void> {
 if(typeof window==='undefined'||!process.env.NEXT_PUBLIC_SENTRY_DSN)return;
 if(!initialized)initialized=import('./sentry').then(module=>module.initializeSentry()).catch(()=>{initialized=null;});
 await initialized;
}
export async function reportClientError(error:unknown,scope:string,traceId:string,lastStep:number):Promise<void> {
 if(typeof window==='undefined'||!process.env.NEXT_PUBLIC_SENTRY_DSN)return;
 try {
  await initializeTelemetry();
  const {captureClientFailure}=await import('./sentry');
  const safe=new Error(error instanceof Error?sanitizeText(error.message):'A data request failed.');
  if(error instanceof Error&&error.stack)safe.stack=sanitizeText(error.stack);
  captureClientFailure(safe,sanitizeText(scope),traceId,lastStep);
 }catch{return;}
}
