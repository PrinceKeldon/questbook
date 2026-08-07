interface RoundProgressProps {
  completed: number
  total: number
  questIds: string[]
  responses: Record<string, string>
}

export default function RoundProgress({
  completed,
  total,
  questIds,
  responses,
}: RoundProgressProps) {
  return (
    <div className="mb-12">
      {/* Summary */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-medium text-ink">Round Progress</p>
            <p className="text-xs text-ink-soft font-mono">
              {completed} of {total} complete
            </p>
          </div>
          <div className="w-full bg-line-soft rounded-full h-2">
            <div
              className="bg-amber h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question dots */}
      <div className="flex gap-2 justify-center flex-wrap">
        {questIds.map((id, idx) => {
          const isAnswered = responses[id]?.trim().length > 0
          return (
            <div
              key={id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                isAnswered
                  ? 'bg-teal text-white'
                  : 'bg-line-soft text-ink-soft'
              }`}
              title={`Question ${idx + 1}`}
            >
              {isAnswered ? '✓' : idx + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}
