import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function compile(name,imports={}){const source=readFileSync(new URL(name,import.meta.url),'utf8');const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const exports={};vm.runInNewContext(output,{exports,require:id=>{if(id in imports)return imports[id];throw new Error('Unexpected test import: '+id);},URLSearchParams,Number,Math,Set,Array});return exports;}
const categories=compile('./categories.ts');
const {defaultFilters,parseFilters,filtersQuery,filterItems}=compile('./filters.ts',{'./categories':categories});
const {itemsCsv}=compile('./csv.ts');
const {parseBookmarks}=compile('./bookmarks.ts');
const item=(id,name,value=null,demand=null,categorySlug='wheels',rarity=null)=>({id,slug:id,name,value,demand,categorySlug,rarity,category:categorySlug,obtainMethod:'unknown',description:'',image:null,isTradable:null});
const rows=[item('a','Alpha',null,null),item('b','Bravo',0,1),item('c','Charlie',100,5,'car-body','Legendary')];
test('URL filters validate enum, category and page boundaries',()=>{const f=parseFilters('?category=invalid&rarity=nonexistent&known=false&sort=secret&page=1.5&view=calendar');assert.equal(f.category,'all');assert.equal(f.rarity,'all');assert.equal(f.known,'all');assert.equal(f.sort,'featured');assert.equal(f.page,1);assert.equal(f.view,'table');assert.equal(parseFilters('?page=99999999999').page,1);});
test('filter state round-trips without losing defaults on category routes',()=>{const original={...defaultFilters,q:'Ice & Sun',category:'wheels',rarity:'legendary',known:'unknown',saved:true,view:'grid',sort:'value-desc',page:3};const restored=parseFilters(filtersQuery(original,'wheels'),'wheels');assert.equal(JSON.stringify(restored),JSON.stringify(original));});
test('search is trimmed and matches category while saved filter is exact',()=>{assert.equal(filterItems(rows,{...defaultFilters,q:' WHEELS '},[]).length,2);assert.equal(filterItems(rows,{...defaultFilters,saved:true},['c'])[0]?.id,'c');});
test('unknown and zero values remain distinct during filtering',()=>{assert.equal(filterItems(rows,{...defaultFilters,known:'known'},[]).length,2);assert.equal(filterItems(rows,{...defaultFilters,known:'unknown'},[])[0]?.id,'a');});
test('value ordering always puts unknown last, in both directions',()=>{assert.equal(filterItems(rows,{...defaultFilters,sort:'value-asc'},[]).map(x=>x.id).join(','),'b,c,a');assert.equal(filterItems(rows,{...defaultFilters,sort:'value-desc'},[]).map(x=>x.id).join(','),'c,b,a');});
test('demand and rarity sort use numbers, with unverified last',()=>{assert.equal(filterItems(rows,{...defaultFilters,sort:'demand-desc'},[]).map(x=>x.id).join(','),'c,b,a');assert.equal(filterItems(rows,{...defaultFilters,sort:'rarity-desc'},[])[0]?.id,'c');});
test('query length is bounded and non-integer pages reject',()=>{assert.equal(parseFilters('?q='+('a'.repeat(300))).q.length,100);assert.equal(parseFilters('?page=-1').page,1);assert.equal(parseFilters('?page=NaN').page,1);});
test('CSV escapes delimiters, formula prefixes and preserves NULL as blank',()=>{const text=itemsCsv([item('a','=SUM(1,2)',null),item('b','A "quote"',0)]);assert.ok(text.startsWith('\uFEFF'));assert.ok(text.includes('"\'=SUM(1,2)"'));assert.ok(text.includes('"A ""quote"""'));assert.ok(text.includes('"0"'));assert.ok(text.includes('"","","Unknown"'));});

test('bookmark cache recovers malformed data and drops invalid entries',()=>{assert.equal(parseBookmarks('broken').length,0);assert.equal(parseBookmarks('{"id":"a"}').length,0);assert.equal(parseBookmarks('["a","a",1,null,"b"]').join(','),'a,b');});
