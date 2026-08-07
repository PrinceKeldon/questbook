import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuestStore } from '@/store/questStore'
import { supabase } from '@/lib/supabase'
import { QuestModule, Pattern } from '@/types'

const QUEST_QUESTIONS: QuestModule = {
  id: 'architecture-of-you-01',
  quest_id: 'architecture-of-you',
  module_order: 1,
  title: 'The Architecture of You',
  is_free: false,
  questions: [
    // Round 1 - Pattern Finder
    {
      id: 'q1',
      number: 1,
      text: "When someone says 'I'm stuck,' what kind of problem are they usually asking you to help with?",
      hint: 'Not what you'd like them to ask. What do they actually ask?',
      round: 1,
      category: 'problems',
    },
    {
      id: 'q2',
      number: 2,
      text: 'Think about the last ten people you've genuinely helped. What did they walk away with?',
      hint: 'Examples: clarity, confidence, a website, a song, a strategy, connections, a system, an introduction, better writing.',
      round: 1,
      category: 'outcomes',
    },
    {
      id: 'q3',
      number: 3,
      text: 'What kinds of work make you completely lose track of time?',
      hint: 'Not because they're fun — because they pull you in.',
      round: 1,
      category: 'flow',
    },
    {
      id: 'q4',
      number: 4,
      text: 'What do you notice that most people seem blind to?',
      hint: 'Could be in people, products, businesses, or culture.',
      round: 1,
      category: 'observation',
    },
    {
      id: 'q5',
      number: 5,
      text: 'When have you been paid, or repeatedly thanked, for something that felt almost unfairly easy?',
      hint: 'Those moments are the most valuable data.',
      round: 1,
      category: 'ease',
    },
    {
      id: 'q6',
      number: 6,
      text: 'Someone hands you £50,000. You have 90 days. You can't spend it on ads. Turn it into £150,000. What would you build, and why that?',
      round: 1,
      category: 'instinct',
    },
    // Round 2 - Friction Test
    {
      id: 'q7',
      number: 7,
      text: 'What work drains you, even if you're good at it?',
      round: 2,
      category: 'drain',
    },
    {
      id: 'q8',
      number: 8,
      text: 'What work energizes you, even when nobody is watching?',
      round: 2,
      category: 'energy',
    },
    {
      id: 'q9',
      number: 9,
      text: 'What kinds of people seem to "find" you naturally?',
      hint: 'Artists, founders, developers, executives, community leaders, students?',
      round: 2,
      category: 'people',
    },
    {
      id: 'q10',
      number: 10,
      text: "What compliments have you heard so many times that you've stopped believing they're special?",
      round: 2,
      category: 'compliments',
    },
    {
      id: 'q11',
      number: 11,
      text: 'If every qualification disappeared tomorrow — no CV, no degree, no title — how would you convince someone to hire you?',
      round: 2,
      category: 'essence',
    },
    // Round 3 - Market Reality Test
    {
      id: 'q12',
      number: 12,
      text: 'What measurable change can you repeatedly create for someone else?',
      hint: 'Examples: launch faster, increase revenue, write clearer copy, grow a community, automate a task, connect the right people.',
      round: 3,
      category: 'measurable',
    },
    {
      id: 'q13',
      number: 13,
      text: 'If you interviewed ten people you've worked with, what would all ten agree you're unusually good at?',
      round: 3,
      category: 'consensus',
    },
    {
      id: 'q14',
      number: 14,
      text: 'If you disappeared from a project tomorrow, what would be hardest to replace?',
      round: 3,
      category: 'irreplaceable',
    },
    {
      id: 'q15',
      number: 15,
      text: "What's the hardest thing you've learned that now feels effortless?",
      round: 3,
      category: 'mastery',
    },
    {
      id: 'q16',
      number: 16,
      text: 'People don't realize I can actually _______________.',
      round: 3,
      category: 'hidden',
    },
  ],
}

export default function QuestPage() {
  const { questId } = useParams<{ questId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    responses,
    currentRound,
    patterns,
    updateResponse,
    detectPatterns,
    initializeQuestionnaire,
    saveProgress,
  } = useQuestStore()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showPatterns, setShowPatterns] = useState(false)
  const [detectedPatterns, setDetectedPatterns] = useState<Pattern[]>([])

  useEffect(() => {
    if (user?.id && questId) {
      initializeQuestionnaire(user.id, questId)
    }
  }, [user?.id, questId])

  const questQuestions = QUEST_QUESTIONS.questions
  const currentQuestion = questQuestions[currentQuestionIndex]
  const roundQuestions = questQuestions.filter((q) => q.round === currentRound)
  const questionsBeforeRound = questQuestions.filter((q) => q.round < currentRound)
  const isLastQuestion = currentQuestionIndex === questQuestions.length - 1
  const isRoundComplete = roundQuestions.every((q) => responses[q.id])

  const handleAnswer = (answer: string) => {
    updateResponse(currentQuestion.id, answer)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)

      // Detect patterns after every question
      detectPatterns()

      // Auto-save progress
      if (user?.id && questId) {
        saveProgress(user.id, questId)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleComplete = async () => {
    if (user?.id && questId) {
      await saveProgress(user.id, questId)
      navigate(`/quest/${questId}/results/1`)
    }
  }

  const progressPercentage = Math.round(
    ((currentQuestionIndex + 1) / questQuestions.length) * 100
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow">The Architecture of You</span>
          <span className="text-sm text-ink-soft">
            Question {currentQuestionIndex + 1} of {questQuestions.length}
          </span>
        </div>
        <div className="w-full bg-line rounded-full h-2">
          <div
            className="bg-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Round Indicator */}
      <div className="mb-8 p-4 bg-paper-light rounded">
        <p className="eyebrow mb-1">
          Round {currentRound} — {
            currentRound === 1
              ? 'Pattern Finder'
              : currentRound === 2
                ? 'Friction Test'
                : 'Market Reality Test'
          }
        </p>
        <p className="text-sm text-ink-soft">
          {currentRound === 1
            ? 'Finding what you actually do, before deciding what to call it.'
            : currentRound === 2
              ? 'Testing what is sustainable for you.'
              : 'Discovering what could actually become valuable.'}
        </p>
      </div>

      {/* Question */}
      <div className="mb-12 p-8 bg-white border border-line rounded">
        <h2 className="text-2xl font-serif mb-4">{currentQuestion.text}</h2>
        {currentQuestion.hint && (
          <p className="text-sm text-ink-soft mb-6 italic">
            {currentQuestion.hint}
          </p>
        )}

        <textarea
          value={responses[currentQuestion.id] || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full h-32 p-4 border border-line rounded resize-none"
        />
      </div>

      {/* Pattern Detection */}
      {Object.keys(responses).length > 3 && (
        <div className="mb-12 p-6 bg-paper-light rounded border border-amber">
          <button
            onClick={() => {
              detectPatterns()
              setShowPatterns(!showPatterns)
            }}
            className="flex items-center gap-2 text-teal hover:text-amber font-medium"
          >
            <span>{showPatterns ? '▼' : '▶'}</span>
            <span>Pattern Detection ({patterns.length} detected)</span>
          </button>

          {showPatterns && patterns.length > 0 && (
            <div className="mt-4 space-y-3">
              {patterns.slice(0, 5).map((pattern) => (
                <div key={pattern.name} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-teal">
                      {pattern.name}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {pattern.strength}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft">
                    Appeared in {pattern.occurrences} answer
                    {pattern.occurrences !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 justify-between mb-12">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {currentQuestionIndex > 0 && (
            <span className="text-xs text-ink-soft self-center">
              {roundQuestions.filter((q) => responses[q.id]).length} /{' '}
              {roundQuestions.length} in this round
            </span>
          )}
        </div>

        {!isLastQuestion ? (
          <button onClick={handleNext} className="btn btn-primary">
            Next →
          </button>
        ) : (
          <button onClick={handleComplete} className="btn btn-primary">
            Complete Quest ✓
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-paper-light rounded text-sm text-ink-soft">
        <p>
          <strong>Tip:</strong> There are no wrong answers. This is an audit of
          your actual life and work, not a personality test. Write what's true,
          not what sounds impressive.
        </p>
      </div>
    </div>
  )
}
