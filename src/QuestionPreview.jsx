import { useState } from 'react';

export default function QuestionPreview({ question, index }) {
  const [open, setOpen] = useState(false);
  return <details className="question-preview" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><span className="preview-number">{String(index + 1).padStart(2, '0')}</span><span>{question.prompt}</span><span className="details-chevron" aria-hidden="true">⌄</span></summary>
    {open && <div className="preview-body">
      {question.image && <img className="question-image" src={question.image.src} alt={question.image.alt} loading="lazy" />}
      {question.type === 'matching' ? <dl className="matching-review">{question.pairs.map(pair => <div key={pair.id}><dt>{pair.prompt}</dt><dd>{pair.answer}</dd></div>)}</dl> : <ul className="preview-options">{question.options.map(option => <li key={option.id} className={question.correctOptionIds.includes(option.id) ? 'right-answer' : ''}><span>{option.text}</span>{question.correctOptionIds.includes(option.id) && <span className="answer-label">✓ Poprawna</span>}</li>)}</ul>}
      {question.type === 'matching' && question.choices && <p className="start-hint">Niewykorzystane odpowiedzi: {question.choices.filter(choice => !question.pairs.some(pair => pair.answer === choice)).join(' · ')}</p>}
      {question.explanation && <p className="explanation">{question.explanation}</p>}
    </div>}
  </details>;
}
