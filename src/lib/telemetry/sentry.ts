import * as Sentry from '@sentry/nextjs';
import { sanitizeText } from './redact';
export function initializeSentry():void {
 const dsn=process.env.NEXT_PUBLIC_SENTRY_DSN;
 if(!dsn||Sentry.getClient())return;
 Sentry.init({dsn,dataCollection:{userInfo:false,cookies:false,httpHeaders:false,httpBodies:[],urlQueryParams:false,graphQL:{document:false,variables:false},genAI:{inputs:false,outputs:false},mcp:{inputs:false,outputs:false},databaseQueryData:false,queues:false,stackFrameVariables:false,frameContextLines:0},tracesSampleRate:0.1,defaultIntegrations:false,
  beforeSend(event){
   delete event.user;delete event.request;delete event.breadcrumbs;delete event.contexts;delete event.extra;delete event.server_name;
   if(event.message)event.message=sanitizeText(event.message);
   if(event.exception?.values)event.exception.values=event.exception.values.map(value=>({type:value.type?sanitizeText(value.type):undefined,value:value.value?sanitizeText(value.value):undefined,stacktrace:value.stacktrace?{frames:value.stacktrace.frames?.map(frame=>({filename:frame.filename?sanitizeText(frame.filename).split('?')[0]:undefined,function:frame.function?sanitizeText(frame.function):undefined,lineno:frame.lineno,colno:frame.colno,in_app:frame.in_app}))}:undefined}));
   event.tags={scope:event.tags?.scope,trace_id:event.tags?.trace_id,step:event.tags?.step};
   return event;
  },
  beforeSendTransaction(){return null;},
 });
}
export function captureClientFailure(error:Error,scope:string,traceId:string,lastStep:number):void {
 Sentry.captureException(error,{tags:{scope,trace_id:traceId,step:String(lastStep)}});
}
