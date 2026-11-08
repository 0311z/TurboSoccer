import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export const LEGACY_HEADERS = ['name','value','image_path','category','rarity','description','demand','variant_parent_id','variant_color_name','variant_color_hex','created_at','updated_at'];
export const LEGACY_SOURCE = { repository:'https://github.com/sacharevet39-dotcom/turbo-soccer-values', commit:'c6b2c80cef8c06b100347a598f9f3aac8f1835de', exporter:'src/App.tsx:806' };
const MAX_BYTES=5*1024*1024, MAX_ROWS=10000, MAX_CELL=20000;
const categories=new Map([['Car bodies','car-body'],['Paint','paint'],['Decals','decal'],['Stickers','sticker'],['Wheels','wheels'],['Boost trails','boost-trail'],['Toppers','topper'],['Horns','horn'],['License plates','license-plate'],['Ball skins','ball-skin'],['Demolition effects','demolition-effect'],['Goal explosions','goal-explosion'],['Emotes','emote']].map(([name,slug])=>[name.toLowerCase(),slug]));
const rarities=new Set(['common','rare','epic','legendary','exclusive']);

export function parseLegacyCsv(text){
 if(typeof text!=='string'||Buffer.byteLength(text,'utf8')>MAX_BYTES)throw new Error('CSV must be UTF-8 text no larger than 5 MiB.');
 if(text.includes('\0'))throw new Error('CSV contains a forbidden NUL byte.');
 const input=text.replace(/^\uFEFF/,'');
 if(!input.length)throw new Error('CSV is empty.');
 const rows=[];let row=[],cell='',quoted=false,closed=false,started=false;
 function field(){if(cell.length>MAX_CELL)throw new Error('CSV cell exceeds the supported size.');row.push(cell);if(row.length>64)throw new Error('CSV has too many columns.');cell='';closed=false;started=false;}
 function record(){field();rows.push(row);row=[];if(rows.length>MAX_ROWS+1)throw new Error('CSV exceeds 10,000 item rows.');}
 for(let index=0;index<input.length;index++){
  const character=input[index];
  if(quoted){if(character==='"'){if(input[index+1]==='"'){cell+='"';index++;}else{quoted=false;closed=true;}}else cell+=character;continue;}
  if(closed&&character!==','&&character!=='\r'&&character!=='\n')throw new Error('Invalid characters after a quoted CSV cell.');
  if(character==='"'){if(started||cell.length)throw new Error('Unexpected quote in unquoted CSV cell.');quoted=true;started=true;}
  else if(character===',')field();
  else if(character==='\r'||character==='\n'){record();if(character==='\r'&&input[index+1]==='\n')index++;}
  else{cell+=character;started=true;if(cell.length>MAX_CELL)throw new Error('CSV cell exceeds the supported size.');}
 }
 if(quoted)throw new Error('CSV contains an unterminated quoted cell.');
 if(cell.length||row.length||started||closed)record();
 return rows;
}
function safeWhole(text,row,column){
 if(text==='')return null;
 if(!/^\d+$/.test(text))throw new Error(`Row ${row}: ${column} must be a non-negative whole number or blank.`);
 const value=Number(text);
 if(!Number.isSafeInteger(value))throw new Error(`Row ${row}: ${column} exceeds the JavaScript safe integer range.`);
 return value;
}
function demandValue(text,row){
 if(text==='')return null;
 if(!/^\d+(?:\.\d+)?$/.test(text))throw new Error(`Row ${row}: demand has an invalid numeric format.`);
 const value=Number(text);
 if(!Number.isFinite(value)||value<0.5||value>5||!Number.isInteger(value*2))throw new Error(`Row ${row}: legacy demand must be 0.5–5 in half-star increments.`);
 return value;
}
function validDate(text,row,column){
 if(!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(text)||!Number.isFinite(Date.parse(text)))throw new Error(`Row ${row}: ${column} must be an ISO timestamp with timezone.`);
 return text;
}
export function convertLegacyCsv(text){
 const [header,...rows]=parseLegacyCsv(text);
 if(!header||new Set(header).size!==header.length)throw new Error('CSV contains duplicate or missing headers.');
 if(header.length!==LEGACY_HEADERS.length||LEGACY_HEADERS.some(name=>!header.includes(name)))throw new Error('Expected the exact 12-column legacy admin Export CSV schema; v2 CSV and database dumps are different formats.');
 const seen=new Set();
 const entries=rows.map((cells,index)=>{
  const row=index+2;
  if(cells.length!==header.length)throw new Error(`Row ${row}: column count does not match the header.`);
  const legacy=Object.fromEntries(header.map((name,column)=>[name,cells[column]]));
  for(const value of cells)if(/^\s*[=+\-@]/u.test(value))throw new Error(`Row ${row}: a spreadsheet formula prefix requires manual removal and review.`);
  const name=legacy.name.trim();
  if(name.length<1||name.length>100)throw new Error(`Row ${row}: item name must contain 1–100 characters.`);
  const identity=name.toLocaleLowerCase('en-US');
  if(seen.has(identity))throw new Error(`Row ${row}: duplicate item name requires manual identity review.`);seen.add(identity);
  const value=safeWhole(legacy.value,row,'value'),originalDemand=demandValue(legacy.demand,row);
  const demand=originalDemand!==null&&Number.isInteger(originalDemand)?originalDemand:null;
  validDate(legacy.created_at,row,'created_at');validDate(legacy.updated_at,row,'updated_at');
  if(legacy.variant_parent_id&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(legacy.variant_parent_id))throw new Error(`Row ${row}: invalid legacy variant parent UUID.`);
  if(legacy.variant_color_hex&&!/^#[0-9a-f]{6}$/i.test(legacy.variant_color_hex))throw new Error(`Row ${row}: invalid legacy variant color.`);
  const categoryCandidate=categories.get(legacy.category.toLowerCase())??null;
  const rarity=legacy.rarity.toLowerCase(),rarityCandidate=rarities.has(rarity)?rarity:null;
  const issues=['ASSIGN_NEW_ITEM_ID_AND_UNIQUE_SLUG','CONFIRM_CATEGORY_MAPPING','CSV_OMITS_LEGACY_ITEM_ID'];
  if(name!==legacy.name)issues.push('CONFIRM_TRIMMED_NAME');
  if(value!==null)issues.push('CONFIRM_VALUE_APPRAISAL');
  if(originalDemand!==null)issues.push(demand===null?'LEGACY_HALF_STAR_REQUIRES_DECISION':'CONFIRM_DEMAND_EVIDENCE');
  if(legacy.rarity)issues.push('CONFIRM_RARITY_EVIDENCE');
  if(legacy.image_path)issues.push('RESOLVE_IMAGE_AND_RIGHTS');
  if(legacy.variant_parent_id||legacy.variant_color_name||legacy.variant_color_hex)issues.push('UNSUPPORTED_VARIANT_MODEL');
  return {sourceRow:row,reviewRequired:true,issues,legacy,draft:{id:null,slug:null,name,value,demand,description:legacy.description,categorySlug:null,raritySlug:null,image:null,isTradable:null,obtainMethod:'unknown'},candidates:{categorySlug:categoryCandidate,raritySlug:rarityCandidate}};
 });
 return {formatVersion:1,purpose:'offline-review-only',source:LEGACY_SOURCE,readyForDatabaseImport:false,itemCount:entries.length,limitations:['No database access or writes occur.','The source CSV omits item IDs, price history, accounts, listings and storage binaries.','Category and rarity candidates require approval; image paths and variant references are never copied to v2 automatically.','Coins remain coins; Gems are not converted or inferred.'],entries};
}
export async function convertLegacyFile(inputFile,outputFile){
 const input=resolve(inputFile),output=resolve(outputFile);
 if(input===output)throw new Error('Input CSV and output JSON must be different files.');
 const info=await stat(input);
 if(!info.isFile()||info.size>MAX_BYTES)throw new Error('Input must be a CSV file no larger than 5 MiB.');
 const buffer=await readFile(input),text=new TextDecoder('utf-8',{fatal:true}).decode(buffer);
 const converted=convertLegacyCsv(text);
 await mkdir(dirname(output),{recursive:true});
 await writeFile(output,JSON.stringify(converted,null,2)+'\n',{encoding:'utf8',flag:'wx',mode:0o600});
 return converted.itemCount;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  if(process.argv.length!==4)throw new Error('Usage: node scripts/import-legacy-csv.mjs turbo-soccer-items.csv work/legacy-review.json');
  const count=await convertLegacyFile(process.argv[2],process.argv[3]);
  console.log(`[TSV][legacy-review] OK ${count} rows · review JSON only · no database writes`);
 }catch(error){console.error('[TSV][legacy-review] FAIL',error instanceof Error?error.message:'Unexpected conversion failure');process.exitCode=1;}
}
