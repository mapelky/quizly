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
      try {
        const response = await fetch('/questions.json');
        if (!response.ok) throw new Error();
        const parsed = parseBank(await response.text());
        builtInBank = parsed;
      } catch {
        storageNotice = 'Nie udało się wczytać wbudowanych pytań. Odśwież stronę i spróbuj ponownie.';
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
            {modules.filter(module => module.id === '1-3').map(module => <Button key={module.id} variant="ghost" className={`module-option ${moduleId === module.id ? 'selected' : ''}`} aria-pressed={moduleId === module.id} onPress={() => setModuleId(module.id)}>
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
        <footer className="module-footer"><span>© 2026 Mateusz Jeżykowski</span></footer>
      </> : <section className="home" aria-labelledby="home-title">
        <NetworkAnimation />
        <h1 id="home-title" ref={heading} tabIndex={-1} lang="en"><span className="home-title-line">Be well prepared</span><span className="home-title-line">with <span className="home-title-brand">quizly</span></span></h1>
        <div className="home-actions"><SpecularButton size="md" onClick={() => start('exam')} disabled={loading}>Losuj 40 pytań</SpecularButton><SpecularButton size="md" onClick={() => start('quick')} disabled={loading}>Losuj 1 pytanie</SpecularButton></div>
      </section>}
    </main>
  </div>;
}
