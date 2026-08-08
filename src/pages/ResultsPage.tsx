import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { generatePersonalizedPDF } from '@/lib/generatePDF'
import { captureSkillGeneration, logPDFDownload } from '@/lib/mlDataCollection'
import ImmediateFeedbackForm from '@/components/ImmediateFeedbackForm'
import { QuestionnaireResponse } from '@/types'

export default function ResultsPage() {
  const { questId, version } = useParams<{
    questId: string
    version: string
  }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    loadResults()
  }, [user?.id, questId, version])

  const loadResults = async () => {
    if (!user?.id || !questId || !version) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', user.id)
        .eq('quest_id', questId)
        .eq('version', parseInt(version))
        .single()

      if (error) throw error
      setQuestionnaire(data)

      // Capture skill generation for ML training
      if (data.skills_canvas && data.responses) {
        await captureSkillGeneration({
          questionnaire_id: data.id,
          version: data.version,
          skills_canvas: data.skills_canvas,
          responses: data.responses,
          question_count: 16,
        })
      }

      // Check if user has already submitted feedback
      const { data: existingFeedback } = await supabase
        .from('immediate_feedback')
        .select('id')
        .eq('questionnaire_id', data.id)
        .single()

      if (!existingFeedback) {
        // Show feedback form after 3 seconds
        setTimeout(() => setShowFeedback(true), 3000)
      } else {
        setFeedbackSubmitted(true)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!questionnaire || !user) return

    setIsGeneratingPDF(true)
    setPdfError(null)

    try {
      await generatePersonalizedPDF({
        questionnaire,
        userName: user.email?.split('@')[0] || 'User',
      })

      // Log download for ML tracking
      const filename = `Architecture_of_You_${user.email?.split('@')[0]}_${new Date().toISOString().split('T')[0]}.pdf`
      await logPDFDownload(questionnaire.id, filename)
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleCreateVersion = async () => {
    if (user?.id && questId) {
      navigate(`/quest/${questId}`)
    }
  }

  const handleFeedbackSubmit = () => {
    setShowFeedback(false)
    setFeedbackSubmitted(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-soft">Loading your results...</p>
      </div>
    )
  }

  if (!questionnaire) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-serif mb-4">Results not found</h1>
        <p className="text-ink-soft mb-6">
          We couldn't find the results for this version.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const canvas = questionnaire.skills_canvas

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="eyebrow mb-4">Your Results</p>
        <h1 className="text-4xl font-serif mb-4">
          You've Found Your Architecture
        </h1>
        <p className="text-lg text-ink-soft mb-8">
          Version {questionnaire.version} —{' '}
          {new Date(questionnaire.created_at).toLocaleDateString()}
        </p>

        {questionnaire.completed_at && (
          <>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? '⟳ Generating PDF...' : '↓ Download PDF'}
              </button>
              <button
                onClick={handleCreateVersion}
                className="btn btn-secondary"
              >
                Create Version {questionnaire.version + 1}
              </button>
            </div>

            {pdfError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {pdfError}
              </div>
            )}
          </>
        )}
      </div>

      {/* Skills Canvas */}
      {canvas && (
        <div className="mb-12 p-8 bg-white border-2 border-ink rounded">
          <h2 className="text-2xl font-serif mb-8 text-center">
            The Skills Canvas
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Innate Strength */}
            <div className="p-6 border border-line rounded">
              <div className="mb-4">
                <p className="eyebrow text-teal mb-2">01 Innate Strength</p>
                <h3 className="text-lg font-serif">{canvas.innate_strength.name}</h3>
                <p className="text-xs text-ink-soft mt-2">
                  {canvas.innate_strength.description}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-ink-soft">NATURAL</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.innate_strength.natural}/5
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-soft">PRACTICAL</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.innate_strength.practical}/5
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-soft">MEASURABLE</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.innate_strength.measurable}/5
                  </p>
                </div>
              </div>
            </div>

            {/* Marketable Skill */}
            <div className="p-6 border border-line rounded">
              <div className="mb-4">
                <p className="eyebrow text-teal mb-2">02 Marketable Skill</p>
                <h3 className="text-lg font-serif">{canvas.marketable_skill.name}</h3>
                <p className="text-xs text-ink-soft mt-2">
                  {canvas.marketable_skill.description}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-ink-soft">NATURAL</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.marketable_skill.natural}/5
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-soft">PRACTICAL</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.marketable_skill.practical}/5
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-soft">MEASURABLE</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.marketable_skill.measurable}/5
                  </p>
                </div>
              </div>
            </div>

            {/* Unique Positioning */}
            <div className="p-6 border border-line rounded">
              <div className="mb-4">
                <p className="eyebrow text-teal mb-2">03 Unique Positioning</p>
                <h3 className="text-lg font-serif">{canvas.unique_positioning.name}</h3>
                <p className="text-xs text-ink-soft mt-2">
                  {canvas.unique_positioning.description}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-ink-soft">NATURAL</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.unique_positioning.natural}/5
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-soft">PRACTICAL</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.unique_positioning.practical}/5
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-soft">MEASURABLE</p>
                  <p className="text-xl font-serif text-amber">
                    {canvas.unique_positioning.measurable}/5
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Positioning Sentence */}
          <div className="p-6 border-2 border-dashed border-amber rounded bg-paper-light">
            <p className="text-sm text-ink-soft mb-2">Your Positioning</p>
            <p className="text-xl font-serif text-teal">
              I help <span className="border-b border-ink">___________</span> do{' '}
              <span className="border-b border-ink">___________</span> so that{' '}
              <span className="border-b border-ink">___________</span>.
            </p>
          </div>
        </div>
      )}

      {/* 7-Day Proof Plan */}
      <div className="mb-12 p-8 bg-white border border-line rounded">
        <h2 className="text-2xl font-serif mb-4">The 7-Day Proof Plan</h2>
        <p className="text-sm text-ink-soft mb-6">
          A Canvas is a hypothesis until someone else confirms it. This plan
          helps you test it in the real world.
        </p>

        <ol className="space-y-6">
          <li className="flex gap-4">
            <span className="font-serif text-2xl text-amber min-w-12">01</span>
            <div>
              <h3 className="font-medium mb-1">List Five People</h3>
              <p className="text-sm text-ink-soft">
                Find five relevant people who match your positioning statement
                — people who've had the problem you solve, or know someone who
                does.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-serif text-2xl text-amber min-w-12">02</span>
            <div>
              <h3 className="font-medium mb-1">Send One Message Each</h3>
              <p className="text-sm text-ink-soft">
                Offer a small paid experiment or session — not a favour, a paid
                pilot. Keep the price low enough to be an easy yes.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-serif text-2xl text-amber min-w-12">03</span>
            <div>
              <h3 className="font-medium mb-1">Deliver It Live</h3>
              <p className="text-sm text-ink-soft">
                No automation, no templates. You, live, with one person. Take
                notes on the exact questions you ask and where energy shifts.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-serif text-2xl text-amber min-w-12">04</span>
            <div>
              <h3 className="font-medium mb-1">Ask for One Sentence</h3>
              <p className="text-sm text-ink-soft">
                After the session, ask: "What changed for you?" Collect their
                words exactly. This becomes your proof line.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-serif text-2xl text-amber min-w-12">05</span>
            <div>
              <h3 className="font-medium mb-1">Repeat</h3>
              <p className="text-sm text-ink-soft">
                Do this with at least three people before changing anything.
                Three data points beat one strong opinion.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Next Steps */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 bg-paper-light rounded">
          <h3 className="font-serif text-lg mb-3">This Workbook Won't End</h3>
          <p className="text-sm text-ink-soft mb-4">
            This is Version {questionnaire.version}. Your Architecture evolves as
            you do.
          </p>
          <p className="text-sm text-ink-soft">
            Come back in a month, a quarter, or a year to create Version{' '}
            {questionnaire.version + 1} and see what's changed.
          </p>
        </div>

        <div className="p-6 bg-paper-light rounded">
          <h3 className="font-serif text-lg mb-3">What's Next?</h3>
          <p className="text-sm text-ink-soft mb-4">
            Once you've tested your positioning with real people, you're ready
            for Module 2: The Offer.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-teal hover:text-amber"
          >
            Explore Future Modules →
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-4 justify-center pb-12">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? '⟳ Generating PDF...' : '↓ Download PDF'}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Feedback Form Modal */}
      {showFeedback && user && questionnaire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto max-w-2xl w-full">
            <div className="p-6">
              <ImmediateFeedbackForm
                user_id={user.id}
                questionnaire_id={questionnaire.id}
                detected_skills={{
                  skill_1: questionnaire.skills_canvas?.innate_strength?.name || 'Skill 1',
                  skill_2: questionnaire.skills_canvas?.marketable_skill?.name || 'Skill 2',
                  skill_3: questionnaire.skills_canvas?.unique_positioning?.name || 'Skill 3',
                }}
                onSubmit={handleFeedbackSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback submitted notice */}
      {feedbackSubmitted && !showFeedback && (
        <div className="fixed bottom-4 right-4 bg-teal text-white p-4 rounded shadow-lg">
          <p className="text-sm">✓ Thank you for your feedback</p>
        </div>
      )}
    </div>
  )
}
