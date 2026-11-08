const privateKey=/password|passphrase|token|authorization|api[_-]?key|email|phone|cookie|secret|credential|session|^user$/i;
const privateQuery=/password|token|authorization|api[_-]?key|email|phone|cookie|secret|credential|session|signature|^code$|^state$|^key$/i;
const MARKER='[REDACTED]';
export function sanitizeText(input:string):string {
 let value=input.slice(0,12000);
 value=value.replace(/https?:\/\/[^\s<>"')\]]+/gi,raw=>{try{const url=new URL(raw);url.username='';url.password='';for(const key of Array.from(url.searchParams.keys()))if(privateQuery.test(key))url.searchParams.set(key,MARKER);if(url.hash)url.hash='';return url.toString();}catch{return '[INVALID URL]';}});
 value=value.replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi,`Bearer ${MARKER}`).replace(/\bBasic\s+[A-Za-z0-9+/]+=*/gi,`Basic ${MARKER}`);
 value=value.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,MARKER);
 value=value.replace(/\bsb_(?:publishable|secret)_[A-Za-z0-9_-]+\b/g,MARKER);
 value=value.replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,MARKER);
 value=value.replace(/((?:password|passphrase|token|access_token|refresh_token|authorization|apikey|api_key|email|cookie|secret|credential|session|code)\s*[:=]\s*)(["'])(.*?)\2/gi,`$1${MARKER}`);
 value=value.replace(/((?:password|passphrase|token|access_token|refresh_token|authorization|apikey|api_key|email|cookie|secret|credential|session|code)\s*[:=]\s*)[^\s,;"'&?#]+/gi,`$1${MARKER}`);
 return input.length>12000?`${value} [TRUNCATED]`:value;
}
export function redact(value:unknown):unknown {
 const seen=new WeakSet<object>();
 function visit(input:unknown,depth:number):unknown {
  if(typeof input==='string')return sanitizeText(input);
  if(typeof input==='bigint')return String(input);
  if(typeof input==='function')return '[FUNCTION]';
  if(typeof input==='symbol')return '[SYMBOL]';
  if(!input||typeof input!=='object')return input;
  if(depth>=8)return '[MAX DEPTH]';
  if(seen.has(input))return '[CIRCULAR]';
  seen.add(input);
  try {
   if(Array.isArray(input))return input.slice(0,100).map(entry=>visit(entry,depth+1));
   const descriptors=Object.getOwnPropertyDescriptors(input);
   const result:Record<string,unknown>={};
   if(input instanceof Error)result.name=sanitizeText(input.name);
   for(const [key,descriptor] of Object.entries(descriptors).slice(0,100))result[key]=privateKey.test(key)?MARKER:'value' in descriptor?visit(descriptor.value,depth+1):'[ACCESSOR OMITTED]';
   return result;
  }catch{return '[UNREADABLE]';}finally{seen.delete(input);}
 }
 try{return visit(value,0);}catch{return '[UNREADABLE]';}
}
