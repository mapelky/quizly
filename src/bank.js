import { validateBank } from './quiz.js';

export const MAX_BANK_BYTES = 5 * 1024 * 1024;
export const BANK_STORAGE_KEY = 'ccna-hub-bank-v1';

export function mergeBanks(builtIn, custom) {
  return {
    version: 1,
    questions: [...new Map([...builtIn.questions, ...custom.questions].map(question => [question.id, question])).values()],
    description: [...new Set([builtIn.description, custom.description].filter(Boolean))].join('\n').slice(0, 2000),
  };
}

export function parseBank(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BANK_BYTES) {
    throw new Error('Plik jest zbyt duży. Maksymalny rozmiar bazy to 5 MB.');
  }
  let bank;
  try { bank = JSON.parse(text); }
  catch { throw new Error('Nie można odczytać JSON. Sprawdź format pliku i spróbuj ponownie.'); }
  const questions = validateBank(bank);
  if (bank.description !== undefined && (typeof bank.description !== 'string' || bank.description.length > 2000)) {
    throw new Error('Opis bazy musi być tekstem o długości maksymalnie 2000 znaków.');
  }
  return { version: 1, questions, description: bank.description || '' };
}
