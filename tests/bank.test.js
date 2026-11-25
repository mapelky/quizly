import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mergeBanks, parseBank } from '../src/bank.js';
import { selectQuestions, isCorrect } from '../src/quiz.js';

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

test('imports modules 4–7 separately and merges both checkpoints without losing questions', async () => {
  const first = parseBank(await readFile(new URL('../public/questions.json', import.meta.url), 'utf8'));
  const ethernet = parseBank(await readFile(new URL('../public/questions-4-7.json', import.meta.url), 'utf8'));
  assert.equal(ethernet.questions.length, 75);
  assert.ok(ethernet.questions.every(q => q.moduleId === '4-7'));
  assert.equal(ethernet.questions.filter(q => q.type === 'single_select').length, 50);
  assert.equal(ethernet.questions.filter(q => q.type === 'multiple_select').length, 24);
  assert.equal(ethernet.questions.filter(q => q.type === 'matching').length, 1);
  assert.equal(ethernet.questions.filter(q => q.id.startsWith('m4-7-q060')).length, 6);
  const merged = mergeBanks(first, ethernet);
  assert.equal(merged.questions.length, 150);
  for (const bank of [first, ethernet]) {
    assert.deepEqual(selectQuestions(merged.questions, bank.questions[0].moduleId, 100).map(q => q.id).sort(), bank.questions.map(q => q.id).sort());
  }
  for (const q of ethernet.questions) {
    const answer = q.type === 'matching' ? Object.fromEntries(q.pairs.map(pair => [pair.id, pair.answer])) : q.correctOptionIds;
    assert.ok(isCorrect(q, answer), q.id);
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
