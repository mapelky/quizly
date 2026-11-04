import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

const bank = JSON.parse(readFileSync(new URL('../../public/questions.json', import.meta.url)));
const single = bank.questions.find(q => q.type === 'single_select');
const multiple = bank.questions.find(q => q.type === 'multiple_select');
const matching = bank.questions.find(q => q.type === 'matching');

async function useQuestions(page, questions) {
  await page.route('**/questions.json', route => route.fulfill({ json: { version: 1, questions } }));
}

async function start(page, mode = 'quick', url = '/') {
  await page.goto(url);
  await page.getByRole('button', { name: mode === 'quick' ? 'Losuj 1 pytanie' : 'Losuj 40 pytań', exact: true }).click();
  await expect(page.locator('#question-title')).toBeVisible();
}

async function answer(page, question) {
  if (question.type === 'matching') {
    for (const [index, pair] of question.pairs.entries()) await page.getByRole('combobox').nth(index).selectOption(pair.answer);
  } else {
    for (const id of question.correctOptionIds) await page.locator(`input[value="${id}"]`).check();
  }
}

async function expectLiveGraphics(page) {
  await expect.poll(() => page.locator('canvas').evaluateAll(canvases => canvases.every(canvas => {
    const gl = canvas.getContext('webgl2');
    return gl && !gl.isContextLost() && gl.getParameter(gl.CURRENT_PROGRAM) !== null;
  }))).toBe(true);
}

test('blocks indexing in HTML and HTTP headers, including assets and dev', async ({ page, request }) => {
  for (const url of ['/', '/moduly', '/questions.json', '/favicon.svg', '/hairline/kernel.js', 'http://127.0.0.1:5185/']) {
    const response = await request.get(url);
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
    if (url === '/' || url === '/moduly') expect(await response.text()).toContain('name="robots" content="noindex, nofollow"');
  }
  const license = await request.get('/licenses/react-bits-LICENSE.txt');
  expect(await license.text()).toBe(readFileSync('src/components/react-bits/LICENSE.md', 'utf8'));
  expect(existsSync('dist/prototypes')).toBe(false);
  expect(existsSync('dist/hairline/network-preview.html')).toBe(false);
  expect(readFileSync('dist/_headers', 'utf8')).toContain('X-Robots-Tag: noindex, nofollow');
  await page.goto('/');
  await expect(page).toHaveTitle('Quizly');
  await page.getByRole('link', { name: 'Moduły i pytania' }).click();
  await expect(page).toHaveTitle('Quizly | Moduły');
  await expect(page.locator('.question-previews > *')).toHaveCount(75);
});

for (const asset of ['kernel.js', 'register.js', 'network.js']) {
  test(`keeps home and quiz usable without Hairline ${asset}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(`**/hairline/${asset}`, route => route.abort());
    await page.goto('/');
    await expect(page.locator('.network-animation img')).toBeVisible();
    expect(await page.locator('.network-animation img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole('button', { name: 'Losuj 1 pytanie', exact: true }).click();
    await expect(page.locator('#question-title')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('falls back when the decorative figure throws while mounting', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/hairline/network.js', route => route.fulfill({
    contentType: 'text/javascript', body: 'window.ccnaNetworkFigure = { mount() { throw new Error("Figure failed"); } };',
  }));
  await page.goto('/');
  await expect(page.locator('.network-animation img')).toBeVisible();
  await page.getByRole('button', { name: 'Losuj 40 pytań', exact: true }).click();
  await expect(page.locator('#question-title')).toBeVisible();
  expect(errors).toEqual([]);
});

test('completes 40 real questions with all answer types and correct grading', async ({ page }) => {
  const questions = bank.questions.slice(0, 40);
  await useQuestions(page, questions);
  await start(page, 'exam');
  await expect(page).toHaveTitle('Quizly | Zaznacz odpowiedź');
  const types = new Set();
  for (let i = 0; i < 40; i++) {
    const prompt = await page.locator('#question-title').textContent();
    const question = questions.find(q => q.prompt === prompt);
    expect(question).toBeTruthy();
    types.add(question.type);
    await answer(page, question);
    await page.getByRole('button', { name: i === 39 ? 'Zakończ test' : 'Dalej', exact: false }).click();
  }
  expect(types.size).toBe(3);
  await expect(page.locator('.score-summary')).toContainText('40 z 40 poprawnych');
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true);
});

test('releases graphics across 25 quick answers and preserves feedback focus and scroll', async ({ page }) => {
  const warnings = [];
  page.on('console', message => { if (/Too many active WebGL contexts/.test(message.text())) warnings.push(message.text()); });
  await useQuestions(page, [single, { ...single, id: 'other-single', prompt: 'Drugie pytanie kontrolne' }]);
  await start(page);
  for (let i = 0; i < 25; i++) {
    await answer(page, single);
    await page.getByRole('button', { name: 'Sprawdź odpowiedź' }).click();
    const next = page.getByRole('button', { name: 'Następne pytanie' });
    await expect(next).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await next.click();
  }
  expect(warnings).toEqual([]);
  await expectLiveGraphics(page);
});

test('keeps graphics alive through the dev StrictMode effect replay', async ({ page }) => {
  await useQuestions(page, [single]);
  await page.goto('http://127.0.0.1:5185/');
  await expect(page.locator('.network-animation svg')).toBeVisible();
  await expectLiveGraphics(page);
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Losuj 1 pytanie', exact: true }).click();
    await expectLiveGraphics(page);
    await page.getByRole('button', { name: '← Strona główna' }).click();
    await expect(page.locator('#home-title')).toBeVisible();
    await expectLiveGraphics(page);
  }
});

test('warns before reload with unfinished answers and lets the user stay', async ({ page }) => {
  await useQuestions(page, [single]);
  await start(page, 'exam');
  await answer(page, single);
  let warned = false;
  page.once('dialog', async dialog => {
    warned = dialog.type() === 'beforeunload';
    await dialog.dismiss();
  });
  // Cancelling beforeunload keeps the existing document, so no load event follows.
  await page.reload({ timeout: 2000 }).catch(error => {
    if (!warned || (!error.message.includes('ERR_ABORTED') && error.name !== 'TimeoutError')) throw error;
  });
  expect(warned).toBe(true);
  await expect(page.locator('input:checked')).toHaveCount(1);
});

test('warns for partial matching, but not empty choices or a graded quick answer', async ({ page }) => {
  await useQuestions(page, [matching]);
  await start(page);
  await page.getByRole('combobox').first().selectOption(matching.pairs[0].answer);
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false);
  await answer(page, matching);
  await page.getByRole('button', { name: 'Sprawdź odpowiedź' }).click();
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true);
  await page.getByRole('button', { name: 'Następne pytanie' }).click();
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true);
  await page.getByRole('button', { name: '← Strona główna' }).click();
  await useQuestions(page, [multiple]);
  await page.reload();
  await page.getByRole('button', { name: 'Losuj 1 pytanie', exact: true }).click();
  const choice = page.locator('input[type="checkbox"]').first();
  await choice.check();
  await choice.uncheck();
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true);
});

test('keeps buttons usable without WebGL and after context loss', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl2' ? null : getContext.call(this, type, ...args);
    };
  });
  await start(page);
  await expect(page.locator('.specular-button--fallback').first()).toBeVisible();
});

test('uses a visible button fallback when an active WebGL context is lost', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Losuj 1 pytanie', exact: true });
  await expectLiveGraphics(page);
  await page.locator('.dither-canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await button.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(button).toHaveClass(/specular-button--fallback/);
  await button.click();
  await expect(page.locator('#question-title')).toBeVisible();
});
