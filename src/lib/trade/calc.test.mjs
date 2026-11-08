import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const nativeRequire = createRequire(import.meta.url);
function compile(name, imports = {}) {
  const path = new URL(name, import.meta.url);
  const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (id) => imports[id] ?? nativeRequire(id), Error, Number, Math, Set, Array });
  return exports;
}
const limits = compile('../../config/limits.ts');
const { calculateTrade, EMPTY_TRADE } = compile('./calc.ts', { '@/config/limits': limits });
const { parseTrade, parseStoredTrade, parseTradeText, integerInput, DRAFT_VERSION } = compile('./state.ts', { './calc': limits });
const item = (id, value) => ({ id, name: id, value });
const line = (itemId, quantity = 1) => ({ itemId, quantity });
const draft = (values) => ({ ...EMPTY_TRADE, ...values });
test('accepting trader receives have and gives want', () => {
  const result = calculateTrade(draft({ have: [line('a')], want: [line('b')] }), [item('a', 150), item('b', 100)]);
  assert.equal(result.verdict, 'win');
  assert.equal(result.diff, 1 / 3);
});
test('fair boundary is inclusive at 10%', () => {
  assert.equal(calculateTrade(draft({ coinsHave: 100, coinsWant: 90 }), []).verdict, 'fair');
  assert.equal(calculateTrade(draft({ coinsHave: 100, coinsWant: 89 }), []).verdict, 'win');
  assert.equal(calculateTrade(draft({ coinsHave: 89, coinsWant: 100 }), []).verdict, 'loss');
});
test('unknown value preserves known partial sum and never becomes zero', () => {
  const result = calculateTrade(draft({ have: [line('unknown'), line('known', 3)], coinsHave: 7 }), [item('unknown', null), item('known', 4)]);
  assert.equal(result.verdict, 'unknown'); assert.equal(result.sumHave, 19); assert.deepEqual(result.unknown, ['unknown']);
});
test('missing catalog id is unknown and empty trade is finite', () => {
  assert.equal(calculateTrade(draft({ have: [line('missing')] }), []).verdict, 'unknown');
  assert.equal(calculateTrade(EMPTY_TRADE, []).diff, 0);
});
test('quantities and coins contribute to totals', () => {
  const result = calculateTrade(draft({ have: [line('a', 3)], coinsHave: 15, want: [line('b', 2)], coinsWant: 5 }), [item('a', 5), item('b', 10)]);
  assert.equal(result.sumHave, 30); assert.equal(result.sumWant, 25);
});
test('overflow and invalid integer inputs are rejected', () => {
  assert.throws(() => calculateTrade(draft({ have: [line('a', 99)] }), [item('a', Number.MAX_SAFE_INTEGER)]));
  assert.throws(() => calculateTrade(draft({ coinsHave: 1.5 }), []));
  assert.throws(() => calculateTrade(draft({ coinsWant: limits.MAX_COINS + 1 }), []));
  assert.throws(() => calculateTrade(draft({ have: [line('a', -1)] }), [item('a', 5)]));
});
test('shared state accepts only known ids, unique lines and safe limits', () => {
  assert.ok(parseTrade(draft({ have: [line('a')] }), ['a']));
  assert.equal(parseTrade(draft({ have: [line('unknown')] }), ['a']), null);
  assert.equal(parseTrade(draft({ have: [line('a'), line('a')] }), ['a']), null);
  assert.equal(parseTrade(draft({ coinsHave: -1 }), []), null);
  assert.equal(parseTrade(draft({ coinsHave: 0.5 }), []), null);
  assert.equal(parseTrade({ ...EMPTY_TRADE, unexpected: true }, []), null);
});

test('versioned persistence migrates legacy raw drafts and retains version1', () => {
  const value = draft({ coinsHave: 70 });
  assert.equal(parseStoredTrade(value).coinsHave, 70);
  assert.equal(parseStoredTrade({ state: { draft: value }, version: DRAFT_VERSION }).coinsHave, 70);
  assert.equal(parseStoredTrade({ state: { draft: value }, version: 0 }).coinsHave, 70);
  assert.equal(parseStoredTrade({ state: { draft: value }, version: 2 }), null);
  assert.equal(parseStoredTrade({ state: { draft: value }, version: '1' }), null);
});
test('malformed and oversized shared links fail without throwing', () => {
  assert.equal(parseTradeText('not JSON', []), null);
  assert.equal(parseTradeText(' '.repeat(8001), []), null);
  assert.equal(parseTradeText(JSON.stringify(draft({ coinsHave: 6 })), []).coinsHave, 6);
  assert.equal(parseTradeText(JSON.stringify(draft({ have: [line('unknown')] })), []), null);
});
test('integer fields reject decimal, exponent, negative and whitespace input', () => {
  for (const invalid of ['', '-1', '1.5', '1e3', ' 1 ', 'Infinity', 'NaN', '+4', '1,000']) assert.equal(integerInput(invalid, 0, 10000), null);
  assert.equal(integerInput('0007', 0, 99), 7);
  assert.equal(integerInput('100', 1, 99), null);
  assert.equal(integerInput('0', 1, 99), null);
  assert.equal(integerInput('99', 1, 99), 99);
});
test('structural trade validation rejects arrays, nullable lines and extra properties', () => {
  assert.equal(parseTrade(null), null);
  assert.equal(parseTrade([]), null);
  assert.equal(parseTrade({ ...EMPTY_TRADE, have: [null] }), null);
  assert.equal(parseTrade(draft({ have: [{ ...line('a'), extra: 1 }] })), null);
  assert.equal(parseTrade(draft({ have: Array.from({ length: 9 }, (_, n) => line(String(n))) })), null);
  assert.ok(parseTrade(draft({ have: [line('a')], want: [line('a')] }), ['a']));
});
test('invalid catalog values cannot produce a trusted verdict', () => {
  assert.throws(() => calculateTrade(draft({ have: [line('a')] }), [item('a', -1)]));
  assert.throws(() => calculateTrade(draft({ have: [line('a')] }), [item('a', 0.5)]));
  assert.throws(() => calculateTrade(draft({ have: [line('a')] }), [item('a', Infinity)]));
  assert.equal(calculateTrade(draft({ have: [line('free')] }), [item('free', 0)]).verdict, 'fair');
});
