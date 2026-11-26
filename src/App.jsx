import { useEffect, useRef, useState } from 'react';
import { Button } from '@heroui/react';
import { BANK_STORAGE_KEY, mergeBanks, parseBank } from './bank.js';
import { modules, questionCount } from './modules.js';
import { selectQuestions } from './quiz.js';
import Quiz from './Quiz.jsx';
import NetworkAnimation from './NetworkAnimation.jsx';
import QuestionPreview from './QuestionPreview.jsx';
import SpecularButton from './components/react-bits/SpecularButton.jsx';
import Dither from './components/react-bits/Dither.jsx';

export default function App() {
  const [bank, setBank] = useState({ version: 1, questions: [], description: '' });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [moduleId, setModuleId] = useState('1-3');
  const isModules = window.location.pathname.replace(/\/$/, '') === '/moduly';
  const [session, setSession] = useState(null);
  const isHome = !isModules && !session;
  const heading = useRef(null);

  useEffect(() => {
    document.title = session ? 'Quizly | Zaznacz odpowiedź' : isModules ? 'Quizly | Moduły' : 'Quizly';
  }, [isModules, session]);

  useEffect(() => {
    let active = true;
    async function load() {
      let storageNotice = '';
      let savedBank = { version: 1, questions: [], description: '' };
      let builtInBank = { version: 1, questions: [], description: '' };
      try {
        const saved = localStorage.getItem(BANK_STORAGE_KEY);
        if (saved !== null) {
          savedBank = parseBank(saved);
        }
      } catch { storageNotice = 'Nie udało się odczytać zapisanych pytań. Wyświetlamy dostępną bazę.'; }
      for (const path of ['/questions.json', '/questions-4-7.json']) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
          const response = await fetch(path, { signal: controller.signal });
          if (!response.ok) throw new Error();
          builtInBank = mergeBanks(builtInBank, parseBank(await response.text()));
        } catch {
          storageNotice = 'Nie udało się wczytać części wbudowanych pytań. Odśwież stronę i spróbuj ponownie.';
        } finally {
          clearTimeout(timeout);
        }
      }
      if (active) {
        setBank(mergeBanks(builtInBank, savedBank));
        if (storageNotice) setNotice({ kind: 'error', text: storageNotice });
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const pool = bank.questions.filter(q => q.moduleId === moduleId);
  const selectedModule = modules.find(module => module.id === moduleId);
  const counts = new Map(modules.map(module => [module.id, bank.questions.filter(q => q.moduleId === module.id).length]));

  function start(mode, scope = 'all') {
    const questions = selectQuestions(bank.questions, scope, mode === 'exam' ? 40 : 1);
    if (!questions.length) {
      if (!isModules) window.location.assign('/moduly');
      else setNotice({ kind: 'error', text: 'Brak dostępnych pytań. Odśwież stronę i spróbuj ponownie.' });
      return;
    }
    setSession({ questions, moduleId: scope, mode });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goHome() {
    setSession(null);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return <div className={isHome ? 'app-shell home-shell' : 'app-shell'}>
    <div className="site-background" aria-hidden="true"><Dither key={isHome ? 'animated' : 'static'} colorNum={16} scale={0.6} waveFrequency={3.1} dpr={1} disableAnimation={!isHome} intro={isHome} enableMouseInteraction={false} clickRipple={false} /></div>
    <a className="skip-link" href="#main">Przejdź do treści</a>
    <header className="site-header">
      {session ? <span className="brand"><img src="/favicon.svg" alt="" />Quizly</span> : <a href="/" className="brand" aria-label="Quizly — strona główna"><img src="/favicon.svg" alt="" />Quizly</a>}
      {!session && <nav aria-label="Nawigacja główna"><a href={isModules ? '/' : '/moduly'}>{isModules ? 'Strona główna' : 'Moduły i pytania'}</a></nav>}
    </header>

    <main id="main" className={session ? 'main-container quiz-container' : isModules ? 'main-container modules-container' : 'home-container'}>
      {session ? <Quiz session={session} bank={bank.questions} onHome={goHome} backLabel={isModules ? 'Moduły i pytania' : 'Strona główna'} /> : isModules ? <>
        <div className="page-heading">
          <div><h1 ref={heading} tabIndex={-1}>Moduły i pytania.</h1><p>Wybierz moduł, aby zobaczyć jego zakres i dostępne pytania.</p></div>
        </div>

        {notice && <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}><span>{notice.text}</span><Button variant="ghost" isIconOnly aria-label="Zamknij komunikat" onPress={() => setNotice(null)}>×</Button></div>}

        <div className="bank-information">
          <p>{loading ? 'Wczytywanie pytań…' : `${questionCount(bank.questions.length)} w bazie.`}</p>
        </div>

        <div className="module-workspace">
          <nav className="module-list" aria-label="Wybierz moduł">
            {modules.filter(module => module.id === '1-3' || module.id === '4-7').map(module => <Button key={module.id} variant="ghost" className={`module-option ${moduleId === module.id ? 'selected' : ''}`} aria-pressed={moduleId === module.id} onPress={() => setModuleId(module.id)}>
              <span className="module-number">{String(module.id).padStart(2, '0')}</span><span>{module.title}</span><span className="module-count" aria-hidden="true">{counts.get(module.id)}</span><span className="visually-hidden">{questionCount(counts.get(module.id))}</span>
            </Button>)}
          </nav>

          <section className="module-questions" aria-labelledby="module-title">
            <div className="module-heading"><span className="overline">Moduł {String(moduleId).padStart(2, '0')} · {questionCount(pool.length)}</span><h2 id="module-title">{selectedModule.title}</h2><p>{selectedModule.description}</p></div>
            {pool.length > 0 ? <>
              <div className="module-actions"><SpecularButton size="sm" onClick={() => start('exam', moduleId)}>Test z modułu</SpecularButton><SpecularButton size="sm" onClick={() => start('quick', moduleId)}>Losuj pytanie</SpecularButton></div>
              <div className="question-previews">{pool.map((question, index) => <QuestionPreview key={question.id} question={question} index={index} />)}</div>
            </> : <div className="empty-module"><p>{loading ? 'Wczytywanie pytań…' : 'Brak dostępnych pytań.'}</p>{!loading && <p>Odśwież stronę i spróbuj ponownie.</p>}</div>}
          </section>
        </div>
      </> : <section className="home" aria-labelledby="home-title">
        <NetworkAnimation />
        <h1 id="home-title" ref={heading} tabIndex={-1} lang="en"><span className="home-title-line">Be well prepared</span><span className="home-title-line">with <span className="home-title-brand">quizly</span></span></h1>
        <div className="home-actions"><SpecularButton size="md" onClick={() => start('exam')} disabled={loading}>Losuj 40 pytań</SpecularButton><SpecularButton size="md" onClick={() => start('quick')} disabled={loading}>Losuj 1 pytanie</SpecularButton></div>
      </section>}
    </main>
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Mateusz Jeżykowski</span>
      <a className="github-link" href="https://github.com/mapelky/quizly" target="_blank" rel="noopener noreferrer" aria-label="Repozytorium Quizly (otwiera nową kartę)">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
      </a>
    </footer>
  </div>;
}
