import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports={};
const source=readFileSync(new URL('./compare.ts',import.meta.url),'utf8');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,URLSearchParams,Set});
const tradeExports={};
const tradeSource=readFileSync(new URL('./comparisonTrade.ts',import.meta.url),'utf8');
vm.runInNewContext(ts.transpileModule(tradeSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:tradeExports,URLSearchParams});
const {parseComparison,comparisonPath,catalogCoverage}=exports;
const {comparisonTradePath}=tradeExports;
const items=['ice-sun','rally','siren','rocket','birthday-cake'].map((slug,index)=>({slug,id:`id-${index}`,value:null,demand:null,isTradable:null}));
test('comparison links preserve order and reject unavailable, repeated and excess items',()=>{
 const result=parseComparison('?items=ice-sun,rally,missing,rally,siren,rocket,birthday-cake',items);
 assert.equal(result.slugs.join(','),'ice-sun,rally,siren,rocket');assert.equal(result.rejected,true);
 assert.equal(parseComparison('?items=missing',items).slugs.length,0);
 assert.equal(parseComparison('?items='+('x'.repeat(501)),items).rejected,true);
});
test('comparison path round-trips encoded slugs and supports an empty workspace',()=>{
 const path=comparisonPath(['siren','ice-sun']);
 assert.equal(parseComparison(path.slice(path.indexOf('?')),items).slugs.join(','),'siren,ice-sun');
 assert.equal(parseComparison('',items).rejected,false);
 assert.equal(comparisonPath([]),'/compare/');
 assert.equal(comparisonPath(['siren','siren']),comparisonPath(['siren']));
});
test('comparison starts a one-for-one trade from the accepting trader perspective',()=>{
 const path=comparisonTradePath(items.slice(0,2));
 const trade=JSON.parse(new URLSearchParams(path.slice(path.indexOf('?'))).get('trade'));
 assert.equal(trade.have[0].itemId,items[0].id);assert.equal(trade.want[0].itemId,items[1].id);
 assert.equal(trade.have[0].quantity,1);assert.equal(trade.coinsHave,0);assert.equal(trade.coinsWant,0);
 assert.equal(comparisonTradePath([items[0]]),null);assert.equal(comparisonTradePath(items),null);
 assert.equal(comparisonTradePath([{...items[0],isTradable:false},items[1]]),null);
});
test('coverage includes zero values and confirmed false tradability, never unknown data',()=>{
 const coverage=catalogCoverage([items[0],{...items[1],value:0,demand:1,isTradable:false}]);
 assert.equal(coverage.total,2);assert.equal(coverage.valued,1);assert.equal(coverage.demand,1);assert.equal(coverage.tradability,1);
 assert.equal(catalogCoverage([]).total,0);
});
