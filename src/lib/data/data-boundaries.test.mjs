import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
function compile(name, runtimeEnv={}){const code=ts.transpileModule(readFileSync(new URL(name,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const exports={};vm.runInNewContext(code,{exports,require:id=>id==='@/config/publicEnv'?compile('../../config/publicEnv.ts',runtimeEnv):require(id),Number,Object,Array,URL,Error,process:{env:runtimeEnv}});return exports;}
const {mapItems}=compile('./items.schema.ts');
const {parseMarketSignals}=compile('./marketSignals.schema.ts');
const {historySchema}=compile('./itemSignals.schema.ts');
const id='00000000-0000-4000-8000-000000000001';
const valid={id,slug:'rally',name:'Rally',value:null,demand:null,image_path:null,description:'Starter',obtain_method:'starter',is_tradable:null,categories:{name:'Car bodies',slug:'car-body'},rarities:null};
test('catalog keeps NULL unknown and exact safe bigint strings',()=>{assert.equal(mapItems([valid])[0].value,null);assert.equal(mapItems([{...valid,value:'9007199254740991'}])[0].value,Number.MAX_SAFE_INTEGER);});
test('catalog rejects unsafe bigint, fractional coins and invalid demand',()=>{for(const value of ['9007199254740992',1.5,-1,'-1'])assert.throws(()=>mapItems([{...valid,value}]));for(const demand of [0,6,1.5])assert.throws(()=>mapItems([{...valid,demand}]));});
test('market distinguishes absent metrics from measured zero',()=>{const signals=parseMarketSignals([{item_id:id,trend:'unknown',change_percent:null}],[]);assert.equal(signals[id].offering,null);assert.equal(signals[id].seeking,null);const measured=parseMarketSignals([],[{item_id:id,offering_count:0,seeking_count:'2'}]);assert.equal(measured[id].offering,0);assert.equal(measured[id].seeking,2);});
test('market rejects invalid ids, forged trend states and unsafe counts',()=>{assert.throws(()=>parseMarketSignals([{item_id:'x',trend:'unknown',change_percent:null}],[]));assert.throws(()=>parseMarketSignals([{item_id:id,trend:'moon',change_percent:null}],[]));assert.throws(()=>parseMarketSignals([],[{item_id:id,offering_count:'9007199254740992',seeking_count:0}]));});
test('history accepts null values while rejecting unsafe appraisals',()=>{assert.equal(historySchema.parse([{value:null,demand:null,created_at:'2026-11-08T00:00:00Z',reason:null}])[0].value,null);assert.throws(()=>historySchema.parse([{value:'9007199254740992',demand:3,created_at:'2026-11-08T00:00:00Z',reason:null}]));});

test('environment rejects incomplete connection and unsafe URL schemes',()=>{assert.throws(()=>compile('../env.ts',{NEXT_PUBLIC_SUPABASE_URL:'https://new-project.supabase.co'}));for(const url of ['javascript:alert(1)','ftp://example.com','http://public.example.com'])assert.throws(()=>compile('../env.ts',{NEXT_PUBLIC_SITE_URL:url}));assert.equal(compile('../env.ts',{NEXT_PUBLIC_SITE_URL:'http://localhost:3000'}).env.configured,false);});
test('production environment cannot activate demo data',()=>{assert.throws(()=>compile('../env.ts',{NODE_ENV:'production',NEXT_PUBLIC_DEMO:'1'}));assert.equal(compile('../env.ts',{}).env.configured,false);});
