import { supabase } from '@/lib/supabase'
import { SkillsCanvas } from '@/types'

interface SkillGenerationData {
  questionnaire_id: string
  version: number
  skills_canvas: SkillsCanvas
  responses: Record<string, string>
  question_count: number
}

export async function captureSkillGeneration(
  data: SkillGenerationData
): Promise<void> {
  try {
    // Calculate metadata
    const answeredCount = Object.values(data.responses).filter(
      (a) => a?.trim().length > 0
    ).length
    const answerLengths = Object.values(data.responses).map((a) =>
      a.split(/\s+/).length
    )
    const avgAnswerLength = Math.round(
      answerLengths.reduce((a, b) => a + b, 0) / answerLengths.length
    )
    const completeness = answeredCount / data.question_count

    // Save skill generation record
    const { error } = await supabase
      .from('skill_generations')
      .insert({
        questionnaire_id: data.questionnaire_id,
        version: data.version,

        // Skills
        skill_1_name: data.skills_canvas.innate_strength.name,
        skill_1_natural: data.skills_canvas.innate_strength.natural,
        skill_1_practical: data.skills_canvas.innate_strength.practical,
        skill_1_measurable: data.skills_canvas.innate_strength.measurable,
        skill_1_confidence: data.skills_canvas.innate_strength.total_score * 20, // Convert 1-5 to 0-100

        skill_2_name: data.skills_canvas.marketable_skill.name,
        skill_2_natural: data.skills_canvas.marketable_skill.natural,
        skill_2_practical: data.skills_canvas.marketable_skill.practical,
        skill_2_measurable: data.skills_canvas.marketable_skill.measurable,
        skill_2_confidence: data.skills_canvas.marketable_skill.total_score * 20,

        skill_3_name: data.skills_canvas.unique_positioning.name,
        skill_3_natural: data.skills_canvas.unique_positioning.natural,
        skill_3_practical: data.skills_canvas.unique_positioning.practical,
        skill_3_measurable: data.skills_canvas.unique_positioning.measurable,
        skill_3_confidence: data.skills_canvas.unique_positioning.total_score * 20,

        // Metadata
        answer_completeness: completeness,
        avg_answer_length: avgAnswerLength,
        response_consistency: 0.85, // TODO: calculate actual consistency
      })

    if (error) throw error
  } catch (error) {
    console.error('Failed to capture skill generation:', error)
    // Don't throw - collection failure shouldn't break user flow
  }
}

export async function logPDFDownload(
  questionnaire_id: string,
  filename: string
): Promise<void> {
  try {
    await supabase
      .from('skill_generations')
      .update({ pdf_downloaded_at: new Date().toISOString(), pdf_filename: filename })
      .eq('questionnaire_id', questionnaire_id)
  } catch (error) {
    console.error('Failed to log PDF download:', error)
  }
}

export async function submitImmediateFeedback(
  user_id: string,
  questionnaire_id: string,
  feedback: {
    accuracy_score: number
    accuracy_comment?: string
    usefulness_score: number
    usefulness_comment?: string
    action_intent?: string
    corrected_skill_1?: string
    corrected_skill_2?: string
    corrected_skill_3?: string
    general_feedback?: string
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('immediate_feedback')
      .insert({
        user_id,
        questionnaire_id,
        ...feedback,
        submitted_at: new Date().toISOString(),
      })

    if (error) throw error
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    throw error
  }
}

export async function schedule3moFollowup(
  user_id: string,
  questionnaire_id: string
): Promise<void> {
  try {
    // Schedule email for 3 months from now
    const scheduled_at = new Date()
    scheduled_at.setMonth(scheduled_at.getMonth() + 3)

    const { error } = await supabase
      .from('outcome_emails')
      .insert({
        user_id,
        questionnaire_id,
        email_type: '3mo',
        scheduled_at: scheduled_at.toISOString(),
      })

    if (error) throw error
  } catch (error) {
    console.error('Failed to schedule 3mo followup:', error)
  }
}

export async function schedule6moFollowup(
  user_id: string,
  questionnaire_id: string
): Promise<void> {
  try {
    const scheduled_at = new Date()
    scheduled_at.setMonth(scheduled_at.getMonth() + 6)

    const { error } = await supabase
      .from('outcome_emails')
      .insert({
        user_id,
        questionnaire_id,
        email_type: '6mo',
        scheduled_at: scheduled_at.toISOString(),
      })

    if (error) throw error
  } catch (error) {
    console.error('Failed to schedule 6mo followup:', error)
  }
}
