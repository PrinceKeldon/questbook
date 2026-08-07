import { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  answer: string
  onAnswerChange: (answer: string) => void
}

export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
}: QuestionCardProps) {
  const charCount = answer.length
  const hasAnswer = answer.trim().length > 0
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="bg-white border border-line rounded-lg p-8">
      {/* Question number and category */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="eyebrow">Q{question.number.toString().padStart(2, '0')}</span>
          <span className="text-xs text-ink-soft font-mono uppercase">
            {question.category}
          </span>
        </div>
      </div>

      {/* Question text */}
      <h2 className="text-2xl font-serif mb-3 text-ink leading-snug">
        {question.text}
      </h2>

      {/* Hint if provided */}
      {question.hint && (
        <p className="text-sm text-ink-soft italic mb-6 pb-6 border-b border-line-soft">
          {question.hint}
        </p>
      )}

      {/* Answer textarea */}
      <div className="mb-4">
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write what's true, not what sounds impressive..."
          className="w-full min-h-40 p-4 border border-line rounded focus:border-teal focus:ring-4 focus:ring-teal/10 resize-none"
          aria-label={`Answer to question ${question.number}`}
          autoFocus
        />
      </div>

      {/* Character and word count */}
      <div className="flex justify-between items-center text-xs text-ink-soft">
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <span className={hasAnswer ? 'text-teal' : 'text-line'}>
          {hasAnswer ? '✓ Answered' : 'Not answered'}
        </span>
      </div>
    </div>
  )
}
