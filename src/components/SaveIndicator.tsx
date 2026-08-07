interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved'
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-8 text-sm">
      {status === 'saving' && (
        <>
          <div className="w-2 h-2 bg-amber rounded-full animate-pulse" />
          <span className="text-ink-soft">Saving your progress...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <div className="w-2 h-2 bg-teal rounded-full" />
          <span className="text-teal">✓ Progress saved</span>
        </>
      )}
    </div>
  )
}
