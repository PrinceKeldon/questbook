import { useState } from 'react'
import { submitImmediateFeedback, schedule3moFollowup, schedule6moFollowup } from '@/lib/mlDataCollection'

interface ImmediateFeedbackFormProps {
  user_id: string
  questionnaire_id: string
  detected_skills: {
    skill_1: string
    skill_2: string
    skill_3: string
  }
  onSubmit: () => void
}

export default function ImmediateFeedbackForm({
  user_id,
  questionnaire_id,
  detected_skills,
  onSubmit,
}: ImmediateFeedbackFormProps) {
  const [step, setStep] = useState<'accuracy' | 'usefulness' | 'action' | 'corrections' | 'done'>(
    'accuracy'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    accuracy_score: 0,
    accuracy_comment: '',
    usefulness_score: 0,
    usefulness_comment: '',
    action_intent: '',
    corrected_skill_1: '',
    corrected_skill_2: '',
    corrected_skill_3: '',
    general_feedback: '',
  })

  const handleNext = () => {
    if (step === 'accuracy' && formData.accuracy_score === 0) {
      setError('Please rate accuracy')
      return
    }
    if (step === 'usefulness' && formData.usefulness_score === 0) {
      setError('Please rate usefulness')
      return
    }

    setError(null)
    if (step === 'accuracy') setStep('usefulness')
    else if (step === 'usefulness') setStep('action')
    else if (step === 'action') setStep('corrections')
    else if (step === 'corrections') handleSubmit()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await submitImmediateFeedback(user_id, questionnaire_id, formData)

      // Schedule follow-ups
      await schedule3moFollowup(user_id, questionnaire_id)
      await schedule6moFollowup(user_id, questionnaire_id)

      setStep('done')
      setTimeout(() => onSubmit(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
      setIsSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-teal rounded-full flex items-center justify-center">
            <span className="text-3xl text-white">✓</span>
          </div>
        </div>
        <h2 className="text-2xl font-serif mb-3">Thank you!</h2>
        <p className="text-ink-soft mb-6">
          Your feedback helps us improve. We'll check in with you in 3 and 6 months to see how these
          skills have evolved.
        </p>
        <p className="text-sm text-ink-soft">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {['accuracy', 'usefulness', 'action', 'corrections'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded ${
              step === s ? 'bg-teal' : ['accuracy', 'usefulness', 'action', 'corrections'].indexOf(step) > i ? 'bg-teal' : 'bg-line-soft'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Accuracy */}
      {step === 'accuracy' && (
        <div>
          <h2 className="text-2xl font-serif mb-6">How accurate were these skills?</h2>
          <p className="text-ink-soft mb-8">
            Looking at your detected skills, how well do they reflect who you actually are?
          </p>

          <div className="space-y-4 mb-8">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setFormData({ ...formData, accuracy_score: score })}
                className={`w-full p-4 text-left border rounded transition ${
                  formData.accuracy_score === score
                    ? 'border-teal bg-teal/5'
                    : 'border-line hover:border-teal'
                }`}
              >
                <div className="font-medium">
                  {'⭐'.repeat(score)} {score}/5
                </div>
                <div className="text-sm text-ink-soft">
                  {
                    [
                      'Not at all',
                      'Somewhat inaccurate',
                      'Somewhat accurate',
                      'Very accurate',
                      'Perfect fit',
                    ][score - 1]
                  }
                </div>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Optional: Any comments about accuracy?"
            value={formData.accuracy_comment}
            onChange={(e) =>
              setFormData({ ...formData, accuracy_comment: e.target.value })
            }
            className="w-full p-4 border border-line rounded mb-6 resize-none h-24"
          />

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <button onClick={handleNext} className="btn btn-primary w-full">
            Next →
          </button>
        </div>
      )}

      {/* Step 2: Usefulness */}
      {step === 'usefulness' && (
        <div>
          <h2 className="text-2xl font-serif mb-6">Did this help clarify your direction?</h2>
          <p className="text-ink-soft mb-8">
            Beyond accuracy, did this exercise help you understand yourself better?
          </p>

          <div className="space-y-4 mb-8">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setFormData({ ...formData, usefulness_score: score })}
                className={`w-full p-4 text-left border rounded transition ${
                  formData.usefulness_score === score
                    ? 'border-amber bg-amber/5'
                    : 'border-line hover:border-amber'
                }`}
              >
                <div className="font-medium">
                  {'💡'.repeat(score)} {score}/5
                </div>
                <div className="text-sm text-ink-soft">
                  {
                    ['Not useful', 'Slightly useful', 'Useful', 'Very useful', 'Extremely useful'][
                      score - 1
                    ]
                  }
                </div>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Optional: How could this be more useful?"
            value={formData.usefulness_comment}
            onChange={(e) =>
              setFormData({ ...formData, usefulness_comment: e.target.value })
            }
            className="w-full p-4 border border-line rounded mb-6 resize-none h-24"
          />

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('accuracy')}
              className="btn btn-secondary flex-1"
            >
              ← Back
            </button>
            <button onClick={handleNext} className="btn btn-primary flex-1">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Action Intent */}
      {step === 'action' && (
        <div>
          <h2 className="text-2xl font-serif mb-6">What will you do with this?</h2>
          <p className="text-ink-soft mb-8">
            How do you plan to use these insights?
          </p>

          <div className="space-y-3 mb-8">
            {[
              { value: 'share_with_mentor', label: '💬 Share with a mentor or coach' },
              { value: 'update_linkedin', label: '🔗 Update LinkedIn/resume' },
              { value: 'career_conversation', label: '🤝 Use in a career conversation' },
              { value: 'personal_reflection', label: '📝 Keep for personal reflection' },
              { value: 'none', label: '✋ Not sure yet' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 p-4 border border-line rounded cursor-pointer hover:border-teal">
                <input
                  type="radio"
                  name="action_intent"
                  value={option.value}
                  checked={formData.action_intent === option.value}
                  onChange={(e) =>
                    setFormData({ ...formData, action_intent: e.target.value })
                  }
                  className="w-4 h-4"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('usefulness')}
              className="btn btn-secondary flex-1"
            >
              ← Back
            </button>
            <button onClick={handleNext} className="btn btn-primary flex-1">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Corrections */}
      {step === 'corrections' && (
        <div>
          <h2 className="text-2xl font-serif mb-6">Any corrections?</h2>
          <p className="text-ink-soft mb-8">
            If any of the detected skills aren't quite right, let us know what they should be. (Optional)
          </p>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">
                Should skill #1 be "{detected_skills.skill_1}" or something else?
              </label>
              <input
                type="text"
                placeholder={`e.g., "Design" instead of "${detected_skills.skill_1}"`}
                value={formData.corrected_skill_1}
                onChange={(e) =>
                  setFormData({ ...formData, corrected_skill_1: e.target.value })
                }
                className="w-full p-3 border border-line rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Should skill #2 be "{detected_skills.skill_2}" or something else?
              </label>
              <input
                type="text"
                placeholder={`e.g., "Writing" instead of "${detected_skills.skill_2}"`}
                value={formData.corrected_skill_2}
                onChange={(e) =>
                  setFormData({ ...formData, corrected_skill_2: e.target.value })
                }
                className="w-full p-3 border border-line rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Should skill #3 be "{detected_skills.skill_3}" or something else?
              </label>
              <input
                type="text"
                placeholder={`e.g., "Negotiation" instead of "${detected_skills.skill_3}"`}
                value={formData.corrected_skill_3}
                onChange={(e) =>
                  setFormData({ ...formData, corrected_skill_3: e.target.value })
                }
                className="w-full p-3 border border-line rounded"
              />
            </div>
          </div>

          <textarea
            placeholder="Anything else? (Optional)"
            value={formData.general_feedback}
            onChange={(e) =>
              setFormData({ ...formData, general_feedback: e.target.value })
            }
            className="w-full p-3 border border-line rounded mb-8 resize-none h-24"
          />

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('action')}
              className="btn btn-secondary flex-1"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
