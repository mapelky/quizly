import { modules } from './modules.js';

function requireText(value, label, max = 10000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error(`${label}: wymagany niepusty tekst (maks. ${max} znaków).`);
  }
}

function requireId(value, label) {
  requireText(value, label, 80);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
    throw new Error(`${label}: użyj liter bez polskich znaków, cyfr, myślnika lub podkreślenia.`);
  }
}

function requireUnique(items, label) {
  if (new Set(items).size !== items.length) throw new Error(`${label}: identyfikatory nie mogą się powtarzać.`);
}

export function validateBank(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.questions) || value.questions.length > 5000) {
    throw new Error('Baza musi mieć version: 1 i tablicę questions (maks. 5000 pytań).');
  }

  value.questions.forEach((q, index) => {
    const label = `Pytanie ${index + 1}`;
    if (!q || typeof q !== 'object') throw new Error(`${label}: nieprawidłowe dane.`);
    requireId(q.id, `${label}, id`);
    requireText(q.prompt, `${label}, treść`);
    if (!modules.some(module => module.id === q.moduleId)) {
      throw new Error(`${label}: moduleId musi wskazywać moduł 1–17 lub sprawdzian "1-3".`);
    }
    if (q.explanation !== undefined) requireText(q.explanation, `${label}, wyjaśnienie`);
    if (q.image !== undefined) {
      requireText(q.image?.alt, `${label}, opis obrazu`, 500);
      requireText(q.image?.src, `${label}, adres obrazu`, 2000);
      const local = /^\/images\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|gif|svg)$/i.test(q.image.src);
      let remote = false;
      try {
        const url = new URL(q.image.src);
        remote = url.protocol === 'https:' && !url.username && !url.password;
      } catch { /* Local images have no URL origin. */ }
      if (!local && !remote) throw new Error(`${label}: obraz wymaga adresu HTTPS lub ścieżki /images/nazwa.png.`);
    }

    if (q.type === 'matching') {
      if (!Array.isArray(q.pairs) || q.pairs.length < 2 || q.pairs.length > 32) {
        throw new Error(`${label}: dopasowanie wymaga od 2 do 32 par.`);
      }
      q.pairs.forEach(pair => {
        requireId(pair?.id, `${label}, id pary`);
        requireText(pair?.prompt, `${label}, lewa strona pary`);
        requireText(pair?.answer, `${label}, prawa strona pary`);
      });
      requireUnique(q.pairs.map(pair => pair.id), label);
      if (q.choices !== undefined) {
        if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 32) {
          throw new Error(`${label}: choices musi zawierać od 2 do 32 odpowiedzi.`);
        }
        q.choices.forEach(choice => requireText(choice, `${label}, opcja dopasowania`));
        requireUnique(q.choices, label);
        if (q.pairs.some(pair => !q.choices.includes(pair.answer))) {
          throw new Error(`${label}: choices musi zawierać wszystkie poprawne odpowiedzi.`);
        }
      }
      return;
    }

    if (!['single_select', 'multiple_select'].includes(q.type)) throw new Error(`${label}: nieobsługiwany typ pytania.`);
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 32) {
      throw new Error(`${label}: wymagane od 2 do 32 odpowiedzi.`);
    }
    q.options.forEach(option => {
      requireId(option?.id, `${label}, id odpowiedzi`);
      requireText(option?.text, `${label}, treść odpowiedzi`);
    });
    const optionIds = q.options.map(option => option.id);
    requireUnique(optionIds, label);
    if (!Array.isArray(q.correctOptionIds) || q.correctOptionIds.length < 1 ||
        q.correctOptionIds.some(id => !optionIds.includes(id)) ||
        (q.type === 'single_select' && q.correctOptionIds.length !== 1) ||
        (q.type === 'multiple_select' && q.correctOptionIds.length < 2)) {
      throw new Error(`${label}: nieprawidłowa lista correctOptionIds.`);
    }
    requireUnique(q.correctOptionIds, label);
  });
  requireUnique(value.questions.map(q => q.id), 'Baza');
  return value.questions;
}

export function selectQuestions(questions, moduleId, count, previousId) {
  let pool = questions.filter(q => moduleId === 'all' || q.moduleId === moduleId);
  if (count === 1 && pool.length > 1) pool = pool.filter(q => q.id !== previousId);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function isCorrect(question, answer) {
  if (question.type === 'matching') {
    return Boolean(answer && !Array.isArray(answer) &&
      Object.keys(answer).length === question.pairs.length &&
      question.pairs.every(pair => Object.hasOwn(answer, pair.id) && answer[pair.id] === pair.answer));
  }
  return Array.isArray(answer) && answer.length === question.correctOptionIds.length &&
    new Set(answer).size === answer.length && question.correctOptionIds.every(id => answer.includes(id));
}

export function gradeQuiz(questions, answers) {
  const correct = questions.filter(q => isCorrect(q, Object.hasOwn(answers, q.id) ? answers[q.id] : undefined)).length;
  return { correct, total: questions.length, percentage: questions.length ? Math.round(correct / questions.length * 100) : 0 };
}
