import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mergeBanks, parseBank } from '../src/bank.js';

test('loads the real format example and the translated modules 1–3 bank', async () => {
  const example = parseBank(await readFile(new URL('../public/example-bank.json', import.meta.url), 'utf8'));
  assert.equal(example.questions.length, 3);
  assert.match(example.description, /nie jest baza ITExamAnswers/);
  const shipped = parseBank(await readFile(new URL('../public/questions.json', import.meta.url), 'utf8'));
  const numbers = Array.from({ length: 76 }, (_, i) => i + 1).filter(number => number !== 60);
  assert.deepEqual(shipped.questions.map(q => q.id), numbers.map(number => `m1-3-q${String(number).padStart(3, '0')}`));
  assert.ok(shipped.questions.every(q => q.moduleId === '1-3'));
  for (const q of shipped.questions.filter(q => q.image)) {
    assert.ok((await readFile(new URL(`../public${q.image.src}`, import.meta.url))).length > 0);
  }
});

test('keeps built-in questions alongside a saved bank without overwriting custom edits', () => {
  const base = { version: 1, description: 'Wbudowana baza', questions: [{ id: 'a' }, { id: 'b' }] };
  const custom = { version: 1, description: 'Własna baza', questions: [{ id: 'b', prompt: 'Własna zmiana' }, { id: 'c' }] };
  const merged = mergeBanks(base, custom);
  assert.deepEqual(merged.questions, [base.questions[0], ...custom.questions]);
  assert.match(merged.description, /Wbudowana baza/);
  assert.match(merged.description, /Własna baza/);
  assert.equal(base.questions.length, 2);
  assert.equal(custom.questions.length, 2);
  assert.deepEqual(mergeBanks(base, { version: 1, questions: [] }).questions, base.questions);
});

test('rejects malformed, oversized or invalid JSON', () => {
  for (const text of ['{', 'null', '{"version":1,"questions":[{}]}', ' '.repeat(5 * 1024 * 1024 + 1)]) {
    assert.throws(() => parseBank(text));
  }
});

test('rejects non-text and oversized descriptions', () => {
  for (const description of [{}, 'x'.repeat(2001)]) {
    assert.throws(() => parseBank(JSON.stringify({ version: 1, description, questions: [] })));
  }
});
