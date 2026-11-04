import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBank, selectQuestions, isCorrect, gradeQuiz } from '../src/quiz.js';

const single = { id: 'm1-q1', moduleId: 1, type: 'single_select', prompt: 'Które urządzenie łączy różne sieci?', options: [{ id: 'a', text: 'Router' }, { id: 'b', text: 'Przełącznik warstwy 2' }], correctOptionIds: ['a'] };
const multiple = { ...single, id: 'm1-q2', type: 'multiple_select', options: [...single.options, { id: 'c', text: 'Host' }], correctOptionIds: ['a', 'c'] };
const matching = { id: 'm2-q1', moduleId: 2, type: 'matching', prompt: 'Dopasuj protokoły do funkcji.', pairs: [{ id: 'dns', prompt: 'DNS', answer: 'Rozwiązywanie nazw' }, { id: 'dhcp', prompt: 'DHCP', answer: 'Przydzielanie adresów' }] };
const bank = (questions = [single, multiple, matching]) => ({ version: 1, questions: structuredClone(questions) });

test('validates the three supported question types and an empty bank', () => {
  assert.deepEqual(validateBank(bank()), [single, multiple, matching]);
  assert.deepEqual(validateBank(bank([])), []);
});

test('accepts the modules 1–3 checkpoint and matching choices that include unused answers', () => {
  const checkpoint = { ...matching, moduleId: '1-3', choices: ['Rozwiązywanie nazw', 'Przydzielanie adresów', 'Przesyłanie plików'] };
  assert.deepEqual(validateBank(bank([checkpoint])), [checkpoint]);
  assert.deepEqual(selectQuestions([single, checkpoint], '1-3', 40), [checkpoint]);
  for (const choices of [[], ['Rozwiązywanie nazw'], ['Rozwiązywanie nazw', 'Przydzielanie adresów', 'Rozwiązywanie nazw'], ['Rozwiązywanie nazw', ''], 'nieprawidłowe']) {
    assert.throws(() => validateBank(bank([{ ...checkpoint, choices }])));
  }
  assert.throws(() => validateBank(bank([{ ...checkpoint, moduleId: '1-4' }])));
});

test('rejects invalid roots, unknown types, modules and duplicate question IDs', () => {
  for (const input of [null, [], {}, { questions: [] }, { version: 2, questions: [] }, bank([{ ...single, moduleId: 0 }]), bank([{ ...single, moduleId: 18 }]), bank([{ ...single, moduleId: '1' }]), bank([{ ...single, type: 'essay' }]), bank([single, single])]) {
    assert.throws(() => validateBank(input), Error);
  }
});

test('rejects missing text, bad options and ambiguous answer keys', () => {
  for (const change of [
    { prompt: '  ' }, { id: '' }, { options: [] },
    { options: [single.options[0], single.options[0]] },
    { options: [{ id: 'a', text: '' }, single.options[1]] },
    { correctOptionIds: [] }, { correctOptionIds: ['x'] },
    { correctOptionIds: ['a', 'a'] }, { correctOptionIds: ['a', 'b'] },
    { explanation: {} },
  ]) assert.throws(() => validateBank(bank([{ ...single, ...change }])));
  assert.throws(() => validateBank(bank([{ ...multiple, correctOptionIds: ['a'] }])));
});

test('validates matching pair identifiers and text', () => {
  for (const pairs of [[], [matching.pairs[0]], [matching.pairs[0], matching.pairs[0]], [{ ...matching.pairs[0], answer: '' }, matching.pairs[1]]]) {
    assert.throws(() => validateBank(bank([{ ...matching, pairs }])));
  }
});

test('accepts accessible HTTPS/local images and rejects unsafe image sources', () => {
  for (const src of ['https://example.org/topology.png', '/images/topology.svg']) {
    assert.equal(validateBank(bank([{ ...single, image: { src, alt: 'Schemat sieci' } }]))[0].image.src, src);
  }
  for (const src of ['javascript:alert(1)', 'data:image/svg+xml,xxx', '//example.org/x', 'http://example.org/x', '/images/../../x', '/images/x?token=1']) {
    assert.throws(() => validateBank(bank([{ ...single, image: { src, alt: 'Schemat' } }])));
  }
  assert.throws(() => validateBank(bank([{ ...single, image: { src: '/images/x.png', alt: '' } }])));
});

test('samples exactly 40 unique questions without mutating the bank', () => {
  const questions = Array.from({ length: 60 }, (_, i) => ({ ...single, id: `q-${i}` }));
  const result = selectQuestions(questions, 'all', 40);
  assert.equal(result.length, 40);
  assert.equal(new Set(result.map(q => q.id)).size, 40);
  assert.equal(questions[0].id, 'q-0');
  assert.equal(questions[59].id, 'q-59');
});

test('filters modules, uses all short-bank questions, and handles empty pools', () => {
  assert.deepEqual(selectQuestions([single, matching], 1, 40), [single]);
  assert.equal(selectQuestions([single, matching], 'all', 40).length, 2);
  assert.deepEqual(selectQuestions([], 'all', 40), []);
  assert.deepEqual(selectQuestions([single], 17, 40), []);
});

test('quick practice avoids the immediately previous question unless it is the only one', () => {
  for (let i = 0; i < 25; i++) assert.equal(selectQuestions([single, multiple], 1, 1, single.id)[0].id, multiple.id);
  assert.deepEqual(selectQuestions([single], 1, 1, single.id), [single]);
});

test('grades exact single and multi selections, ignoring selection order', () => {
  assert.equal(isCorrect(single, ['a']), true);
  assert.equal(isCorrect(single, ['b']), false);
  assert.equal(isCorrect(single, ['a', 'b']), false);
  assert.equal(isCorrect(multiple, ['c', 'a']), true);
  assert.equal(isCorrect(multiple, ['a']), false);
  assert.equal(isCorrect(multiple, ['a', 'b', 'c']), false);
  assert.equal(isCorrect(multiple, ['a', 'a', 'c']), false);
  assert.equal(isCorrect(single, undefined), false);
});

test('grades matching exactly and rejects missing or extraneous answers', () => {
  const correct = { dns: 'Rozwiązywanie nazw', dhcp: 'Przydzielanie adresów' };
  assert.equal(isCorrect(matching, correct), true);
  assert.equal(isCorrect(matching, { dns: 'Rozwiązywanie nazw' }), false);
  assert.equal(isCorrect(matching, { ...correct, extra: 'x' }), false);
  assert.equal(isCorrect(matching, undefined), false);
});

test('scores unanswered questions as incorrect and computes percentage from the actual total', () => {
  assert.deepEqual(gradeQuiz([single, multiple, matching], { [single.id]: ['a'], [multiple.id]: ['c', 'a'] }), { correct: 2, total: 3, percentage: 67 });
  assert.deepEqual(gradeQuiz([], {}), { correct: 0, total: 0, percentage: 0 });
});
