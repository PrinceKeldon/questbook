import { useEffect, useState } from 'react'

interface RoundTransitionProps {
  round: number
  onComplete: () => void
}

const roundInfo = {
  1: {
    title: 'The Pattern Finder',
    description: 'Finding what you actually do, before deciding what to call it.',
    completed: "You've explored what people ask you for, what energizes you, and what you notice.",
  },
  2: {
    title: 'The Friction Test',
    description: 'Testing what is sustainable for you.',
    completed: "You've identified what drains you, what energizes you, and who naturally seeks you out.",
  },
  3: {
    title: 'The Market Reality Test',
    description: 'Discovering what could actually become valuable.',
    completed: "You've examined what measurable outcomes you create and what makes you difficult to replace.",
  },
}

export default function RoundTransition({ round, onComplete }: RoundTransitionProps) {
  const [isVisible, setIsVisible] = useState(true)
  const info = roundInfo[round as keyof typeof roundInfo] || roundInfo[2]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div
        className={`max-w-2xl text-center transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Completion checkmark */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-teal rounded-full flex items-center justify-center">
            <span className="text-3xl text-white">✓</span>
          </div>
        </div>

        {/* Message */}
        <p className="eyebrow mb-4">Round {round - 1} Complete</p>
        <h2 className="text-3xl font-serif mb-4 text-ink">Well done.</h2>
        <p className="text-sm text-ink-soft mb-8 max-w-md mx-auto">
          {roundInfo[round - 1 as keyof typeof roundInfo]?.completed ||
            'Round completed.'}
        </p>

        {/* Next Round Preview */}
        <div className="p-6 bg-white border border-line rounded mb-8">
          <p className="eyebrow mb-3">Next: Round {round}</p>
          <h3 className="text-xl font-serif mb-2">{info.title}</h3>
          <p className="text-sm text-ink-soft">{info.description}</p>
        </div>

        {/* Hint */}
        <p className="text-xs text-ink-soft">
          Continuing in 3 seconds... Press any key to skip.
        </p>
      </div>
    </div>
  )
}
