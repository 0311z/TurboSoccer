export function parseBookmarks(raw:string|null):string[]{
 try{const value:unknown=JSON.parse(raw??'[]');return Array.isArray(value)?[...new Set(value.filter((entry):entry is string=>typeof entry==='string'&&entry.length>0&&entry.length<=100))].slice(0,500):[];}catch{return [];}
}
