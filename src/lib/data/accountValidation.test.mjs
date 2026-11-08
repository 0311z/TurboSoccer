import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('./accountValidation.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const exports = {};
vm.runInNewContext(code, { exports, Number });
const { validateProfileInput, parseAppraisal } = exports;
const profile = { username: 'player_123', robloxUsername: 'Player123', bio: '' };
const appraisal = { itemId: '00000000-0000-4000-8000-000000000001', value: '1234', demand: '3', reason: 'Observed in-game trades' };
test('profile permits only the three editable field domains', () => {
  assert.equal(validateProfileInput(profile), null);
  for (const username of ['Abc', 'x', 'player-name', 'a'.repeat(21)]) assert.ok(validateProfileInput({ ...profile, username }));
  assert.ok(validateProfileInput({ ...profile, robloxUsername: 'bad name' }));
  assert.ok(validateProfileInput({ ...profile, bio: 'x'.repeat(281) }));
  assert.equal(validateProfileInput({ ...profile, robloxUsername: '' }), null);
});
test('appraisal preserves unknown independently from zero', () => {
  assert.equal(parseAppraisal({ ...appraisal, value: '' }).value, null);
  assert.equal(parseAppraisal({ ...appraisal, value: '0' }).value, 0);
  assert.equal(parseAppraisal({ ...appraisal, demand: '' }).demand, null);
  assert.equal(parseAppraisal(appraisal).value, 1234);
});
test('appraisal rejects floats, exponent notation, negatives and unsafe totals', () => {
  for (const value of ['-1', '1.5', '1e3', ' 50 ', '9007199254740992']) assert.equal(parseAppraisal({ ...appraisal, value }), null);
  assert.equal(parseAppraisal({ ...appraisal, value: '9007199254740991' }).value, Number.MAX_SAFE_INTEGER);
});
test('appraisal requires valid item identity, demand domain and evidence', () => {
  assert.equal(parseAppraisal({ ...appraisal, itemId: 'rally' }), null);
  for (const demand of ['0', '6', '1.5', '01']) assert.equal(parseAppraisal({ ...appraisal, demand }), null);
  assert.equal(parseAppraisal({ ...appraisal, reason: ' ' }), null);
  assert.equal(parseAppraisal({ ...appraisal, reason: 'x'.repeat(281) }), null);
});
