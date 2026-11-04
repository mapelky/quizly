import { useEffect, useRef, useState } from 'react';
import { Button } from '@heroui/react';
import SpecularButton from './components/react-bits/SpecularButton.jsx';
import { modules, questionCount } from './modules.js';
import { gradeQuiz, isCorrect, selectQuestions } from './quiz.js';

function AnswerReview({ question, answer }) {
  const correct = isCorrect(question, answer);
  return <div className={`answer-review ${correct ? 'correct' : 'incorrect'}`}>
    <strong className="feedback-title"><span aria-hidden="true">{correct ? '✓' : '×'}</span>{correct ? 'Poprawna odpowiedź.' : 'Niepoprawna odpowiedź.'}</strong>
    {question.type === 'matching' ? <dl className="matching-review">{question.pairs.map(pair => <div key={pair.id}><dt>{pair.prompt}</dt><dd>{pair.answer}{answer?.[pair.id] !== pair.answer && <span className="your-answer">Twoja odpowiedź: {answer?.[pair.id] || 'brak'}</span>}</dd></div>)}</dl> : <ul className="review-options">{question.options.map(option => <li key={option.id} className={question.correctOptionIds.includes(option.id) ? 'right-answer' : ''}><span aria-hidden="true">{question.correctOptionIds.includes(option.id) ? '✓' : '·'}</span><span>{option.text}{Array.isArray(answer) && answer.includes(option.id) && <small>Twój wybór</small>}</span></li>)}</ul>}
    {question.type === 'matching' && question.choices && <p className="start-hint">Niewykorzystane odpowiedzi: {question.choices.filter(choice => !question.pairs.some(pair => pair.answer === choice)).join(' · ')}</p>}
    {question.explanation && <p className="explanation">{question.explanation}</p>}
  </div>;
}

export default function Quiz({ session, bank, onHome, backLabel }) {
  const [questions, setQuestions] = useState(session.questions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const title = useRef(null);
  const nextButton = useRef(null);
  const isQuick = session.mode === 'quick';
  const question = questions[index];
  const answer = Object.hasOwn(answers, question.id) ? answers[question.id] : undefined;
  const score = gradeQuiz(questions, answers);
  const module = modules.find(item => item.id === question.moduleId);
  const isComplete = question.type === 'matching'
    ? question.pairs.every(pair => answer && Object.hasOwn(answer, pair.id) && answer[pair.id])
    : Array.isArray(answer) && answer.length > 0;
  const answeredCount = questions.filter(q => {
    const value = Object.hasOwn(answers, q.id) ? answers[q.id] : undefined;
    return q.type === 'matching' ? q.pairs.every(pair => value && Object.hasOwn(value, pair.id) && value[pair.id]) : Array.isArray(value) && value.length > 0;
  }).length;
  const hasAnswers = Object.values(answers).some(value => Array.isArray(value) ? value.length > 0 : Object.values(value).some(Boolean));
  const hasUnfinishedAnswers = hasAnswers && !finished && !(isQuick && submitted);

  useEffect(() => {
    if (!hasUnfinishedAnswers) return;
    const warnBeforeLeaving = event => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasUnfinishedAnswers]);

  useEffect(() => {
    if (submitted) {
      nextButton.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    else title.current?.focus();
  }, [index, question.id, finished, submitted]);
  useEffect(() => {
    if (finished) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [finished]);

  function setAnswer(value) { setAnswers(previous => ({ ...previous, [question.id]: value })); }

  function nextQuestion() {
    const next = selectQuestions(bank, session.moduleId, 1, question.id);
    if (!next.length) return;
    setQuestions(next); setIndex(0); setAnswers({}); setSubmitted(false);
  }

  function restart() {
    setQuestions(selectQuestions(bank, session.moduleId, isQuick ? 1 : 40));
    setIndex(0); setAnswers({}); setSubmitted(false); setFinished(false);
  }

  return <>
    <div className="quiz-toolbar"><SpecularButton size="sm" type="button" className="quiz-action" onClick={() => finished || Object.keys(answers).length === 0 ? onHome() : setQuitting(true)}>← {backLabel}</SpecularButton><span>{isQuick ? 'Szybkie pytanie' : 'Sprawdzian wiedzy'}<span className="toolbar-divider">/</span>{session.moduleId === 'all' ? 'Wszystkie moduły' : `Moduł ${session.moduleId}`}</span></div>
    {quitting && <div className="quit-notice" role="alert"><p>Opuścić sesję? Odpowiedzi z tej sesji zostaną utracone.</p><div><SpecularButton size="sm" type="button" className="quiz-action" onClick={() => setQuitting(false)}>Zostań</SpecularButton><SpecularButton size="sm" type="button" className="quiz-action" onClick={onHome}>{backLabel}</SpecularButton></div></div>}

    {finished ? <section className="results" aria-labelledby="result-title">
      <div className="result-heading"><div><span className="eyebrow">Podsumowanie sesji</span><h1 id="result-title" ref={title} tabIndex={-1}>Wynik testu.</h1><p>Przejrzyj odpowiedzi i sprawdź, które zagadnienia wymagają powtórki.</p><div className="result-actions"><SpecularButton size="sm" type="button" className="quiz-action" onClick={restart}>Wylosuj nowy test <span aria-hidden="true">↗</span></SpecularButton><SpecularButton size="sm" type="button" className="quiz-action" onClick={onHome}>{backLabel}</SpecularButton></div></div><div className="score-summary"><strong>{score.percentage}<small>%</small></strong><span>{score.correct} z {score.total} poprawnych</span></div></div>
      <div className="review-heading"><h2>Twoje odpowiedzi</h2><span>{questionCount(questions.length)} · {score.total - score.correct} do powtórki</span></div>
      <div className="results-list">{questions.map((q, i) => <details className="result-item" key={q.id}><summary><span className={`result-symbol ${isCorrect(q, answers[q.id]) ? 'is-correct' : ''}`}>{isCorrect(q, answers[q.id]) ? '✓' : '×'}<span className="visually-hidden">{isCorrect(q, answers[q.id]) ? 'Poprawnie' : 'Niepoprawnie'}</span></span><span><small>Pytanie {i + 1} · Moduł {q.moduleId}</small><strong>{q.prompt}</strong></span><span className="details-chevron" aria-hidden="true">⌄</span></summary><div className="result-item-body">{q.image && <img className="question-image" src={q.image.src} alt={q.image.alt} loading="lazy" />}<AnswerReview question={q} answer={answers[q.id]} /></div></details>)}</div>
    </section> : <section className="quiz-content" aria-labelledby="question-title">
      {!isQuick && <div className="quiz-progress-label"><span>Pytanie {index + 1} z {questions.length}</span><span>{answeredCount} z {questions.length} uzupełnionych</span></div>}
      {!isQuick && <progress className="quiz-progress" value={index + 1} max={questions.length} aria-label="Pozycja w teście" />}
      <div className="question-surface">
        <div className="question-meta"><span>Moduł {String(question.moduleId).padStart(2, '0')}</span><span>{module?.title}</span></div>
        <h1 id="question-title" ref={title} tabIndex={-1}>{question.prompt}</h1>
        <p className="question-instruction">{question.type === 'matching' ? 'Dopasuj odpowiedź do każdego elementu.' : question.type === 'multiple_select' ? `Wybierz ${question.correctOptionIds.length} odpowiedzi.` : 'Wybierz jedną odpowiedź.'}</p>
        {question.image && <img className="question-image" src={question.image.src} alt={question.image.alt} />}

        <form onSubmit={event => { event.preventDefault(); if (isQuick && isComplete) setSubmitted(true); }}>
          <fieldset className="answers" disabled={submitted}>
            <legend className="visually-hidden">Odpowiedzi do pytania</legend>
            {question.type === 'matching' ? question.pairs.map(pair => <label className="matching-pair" key={pair.id}><span>{pair.prompt}</span><select value={answer?.[pair.id] || ''} onChange={event => setAnswer({ ...(answer || {}), [pair.id]: event.target.value })}><option value="">Wybierz odpowiedź…</option>{[...(question.choices || new Set(question.pairs.map(item => item.answer)))].sort((a, b) => a.localeCompare(b, 'pl')).map(value => <option key={value} value={value}>{value}</option>)}</select></label>) : question.options.map((option, i) => {
              const selected = Array.isArray(answer) && answer.includes(option.id);
              const correct = submitted && question.correctOptionIds.includes(option.id);
              return <label className={`answer-option ${selected ? 'chosen' : ''} ${correct ? 'correct-option' : ''} ${submitted && selected && !correct ? 'wrong-option' : ''}`} key={option.id}><input type={question.type === 'single_select' ? 'radio' : 'checkbox'} name={question.id} value={option.id} checked={selected} onChange={() => setAnswer(question.type === 'single_select' ? [option.id] : selected ? answer.filter(id => id !== option.id) : [...(answer || []), option.id])} /><span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span>{option.text}</span>{submitted && <span className="option-verdict">{correct ? '✓ Poprawna' : selected ? '× Twój wybór' : ''}</span>}</label>;
            })}
          </fieldset>
          {isQuick && !submitted && <SpecularButton size="sm" type="submit" className="quiz-action check-button" disabled={!isComplete}>Sprawdź odpowiedź <span aria-hidden="true">↗</span></SpecularButton>}
        </form>

        {isQuick && submitted && <div className="quick-feedback" role="status"><AnswerReview question={question} answer={answer} /><SpecularButton size="sm" type="button" className="quiz-action" ref={nextButton} onClick={nextQuestion}>Następne pytanie <span aria-hidden="true">→</span></SpecularButton>{bank.filter(q => session.moduleId === 'all' || q.moduleId === session.moduleId).length === 1 && <p className="start-hint">To jedyne pytanie w tym zakresie. Kolejne losowanie je powtórzy.</p>}</div>}

        {!isQuick && <div className="exam-navigation"><SpecularButton size="sm" type="button" className="quiz-action" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Poprzednie</SpecularButton><span>{index === questions.length - 1 ? `Bez odpowiedzi: ${questions.length - answeredCount}` : 'Odpowiedzi sprawdzisz na końcu'}</span><SpecularButton size="sm" type="button" className="quiz-action" onClick={() => index === questions.length - 1 ? setFinished(true) : setIndex(index + 1)}>{index === questions.length - 1 ? 'Zakończ test' : 'Dalej'} <span aria-hidden="true">→</span></SpecularButton></div>}
      </div>

      {!isQuick && <nav className="question-map" aria-label="Przejdź do pytania">{questions.map((q, i) => <Button key={q.id} type="button" className={Object.hasOwn(answers, q.id) && (q.type === 'matching' ? q.pairs.every(pair => answers[q.id]?.[pair.id]) : answers[q.id]?.length > 0) ? 'answered' : ''} aria-current={index === i ? 'step' : undefined} aria-label={`Pytanie ${i + 1}`} onPress={() => setIndex(i)}>{i + 1}</Button>)}</nav>}
    </section>}
  </>;
}
