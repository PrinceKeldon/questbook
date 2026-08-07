import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Quest, QuestionnaireResponse } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [quests, setQuests] = useState<Quest[]>([])
  const [userResponses, setUserResponses] = useState<QuestionnaireResponse[]>(
    []
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuests()
  }, [user?.id])

  const loadQuests = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Load all available quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .order('module_order', { ascending: true })

      // Load user's responses
      const { data: responsesData } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setQuests(questsData || [])
      setUserResponses(responsesData || [])
    } catch (error) {
      console.error('Error loading quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserQuestProgress = (questId: string) => {
    const responses = userResponses.filter((r) => r.quest_id === questId)
    if (responses.length === 0) return null
    return responses[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-soft">Loading your quests...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <p className="eyebrow mb-2">Welcome Back</p>
        <h1 className="text-4xl font-serif mb-4">
          {user?.email?.split('@')[0]}
        </h1>
        <p className="text-lg text-ink-soft">
          Continue your journey of self-discovery.
        </p>
      </div>

      {/* Quests Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {quests.map((quest) => {
          const progress = getUserQuestProgress(quest.id)

          return (
            <div
              key={quest.id}
              className="p-8 bg-white border border-line rounded"
            >
              <div className="mb-4">
                <p className="eyebrow mb-2">
                  Field Manual No. {quest.module_order}
                </p>
                <h2 className="text-2xl font-serif mb-2">{quest.title}</h2>
                <p className="text-sm text-ink-soft">{quest.description}</p>
              </div>

              {/* Progress indicator */}
              {progress && (
                <div className="my-4 p-3 bg-paper-light rounded text-sm">
                  <p className="text-ink-soft mb-1">
                    {progress.completed_at
                      ? '✓ Completed'
                      : '◐ In Progress'}
                  </p>
                  {progress.skills_canvas && (
                    <p className="text-teal font-medium">
                      Version {progress.version} available
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {progress ? (
                  <>
                    <Link
                      to={`/quest/${quest.id}/results/${progress.version}`}
                      className="btn btn-secondary text-center"
                    >
                      View Results
                    </Link>
                    <Link
                      to={`/quest/${quest.id}`}
                      className="btn btn-secondary text-center"
                    >
                      Continue/Edit
                    </Link>
                  </>
                ) : (
                  <Link
                    to={`/quest/${quest.id}`}
                    className="btn btn-primary text-center"
                  >
                    Begin Quest →
                  </Link>
                )}
              </div>

              {/* Past versions */}
              {progress && userResponses.filter((r) => r.quest_id === quest.id).length > 1 && (
                <div className="mt-4 pt-4 border-t border-line-soft">
                  <p className="text-xs eyebrow mb-2">Previous Versions</p>
                  <div className="space-y-1">
                    {userResponses
                      .filter((r) => r.quest_id === quest.id)
                      .slice(1)
                      .map((version) => (
                        <Link
                          key={version.id}
                          to={`/quest/${quest.id}/results/${version.version}`}
                          className="block text-xs text-teal hover:text-amber"
                        >
                          Version {version.version} —{' '}
                          {new Date(version.created_at).toLocaleDateString()}
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Section */}
      <div className="mt-12 p-8 bg-paper-light rounded">
        <h2 className="text-2xl font-serif mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <p className="eyebrow mb-2">01 Complete Quest</p>
            <p className="text-sm text-ink-soft">
              Answer 20 carefully designed questions across 3 rounds.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">02 Discover Patterns</p>
            <p className="text-sm text-ink-soft">
              Real-time pattern detection reveals what the system finds in your
              answers.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">03 Get Results</p>
            <p className="text-sm text-ink-soft">
              Download your personalized Architecture as a beautiful PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
