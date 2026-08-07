import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { QuestionnaireResponse, Pattern, SkillsCanvas } from '@/types'

interface QuestState {
  currentQuestionnaire: QuestionnaireResponse | null
  responses: Record<string, string>
  currentRound: number
  patterns: Pattern[]
  skillsCanvas: SkillsCanvas | null
  loading: boolean
  error: string | null

  // Methods
  initializeQuestionnaire: (userId: string, questId: string) => Promise<void>
  loadExistingQuestionnaire: (
    userId: string,
    questId: string,
    version: number
  ) => Promise<void>
  updateResponse: (questionId: string, answer: string) => void
  detectPatterns: () => void
  generateSkillsCanvas: () => Promise<void>
  saveProgress: () => Promise<void>
  completeQuestionnaire: () => Promise<void>
  createVersion: (userId: string, questId: string) => Promise<void>
  reset: () => void
}

export const useQuestStore = create<QuestState>((set, get) => ({
  currentQuestionnaire: null,
  responses: {},
  currentRound: 1,
  patterns: [],
  skillsCanvas: null,
  loading: false,
  error: null,

  initializeQuestionnaire: async (userId: string, questId: string) => {
    set({ loading: true })
    try {
      // Check if questionnaire exists
      const { data: existing } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        set({ currentQuestionnaire: existing, responses: existing.responses })
      } else {
        // Create new questionnaire
        const { data: newQuestionnaire } = await supabase
          .from('questionnaires')
          .insert([
            {
              user_id: userId,
              quest_id: questId,
              version: 1,
              responses: {},
            },
          ])
          .select()
          .single()

        set({ currentQuestionnaire: newQuestionnaire })
      }
      set({ loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize',
        loading: false,
      })
    }
  },

  loadExistingQuestionnaire: async (
    userId: string,
    questId: string,
    version: number
  ) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .eq('version', version)
        .single()

      if (error) throw error

      set({
        currentQuestionnaire: data,
        responses: data.responses || {},
        skillsCanvas: data.skills_canvas,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load',
        loading: false,
      })
    }
  },

  updateResponse: (questionId: string, answer: string) => {
    const { responses } = get()
    set({ responses: { ...responses, [questionId]: answer } })
  },

  detectPatterns: () => {
    const { responses } = get()
    const patterns: Record<string, Pattern> = {}

    // Simple pattern detection logic
    // This will be expanded with ML/heuristics
    Object.entries(responses).forEach(([qId, answer]) => {
      if (!answer) return

      // Extract key words from answers
      const keywords = answer
        .toLowerCase()
        .match(/\b[a-z]{4,}\b/g) || []

      keywords.forEach((keyword) => {
        if (!patterns[keyword]) {
          patterns[keyword] = {
            name: keyword,
            occurrences: 0,
            questions: [],
            strength: 'weak',
          }
        }
        patterns[keyword].occurrences++
        patterns[keyword].questions.push(qId)
      })
    })

    // Score patterns
    const scored: Pattern[] = Object.values(patterns)
      .map((p) => ({
        ...p,
        strength: (
          p.occurrences >= 3
            ? 'strong'
            : p.occurrences >= 2
              ? 'medium'
              : 'weak'
        ) as 'weak' | 'medium' | 'strong',
      }))
      .filter((p) => p.strength !== 'weak')
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10)

    set({ patterns: scored })
  },

  generateSkillsCanvas: async () => {
    set({ loading: true })
    try {
      const { responses, patterns } = get()

      // Generate skills based on patterns
      // This is a simplified version - will be expanded
      const skills: SkillsCanvas = {
        innate_strength: {
          name: patterns[0]?.name || 'Leadership',
          description:
            'What you naturally do better than most people, unprompted.',
          natural: 4,
          practical: 3,
          measurable: 3,
          total_score: 10,
        },
        marketable_skill: {
          name: patterns[1]?.name || 'Problem-Solving',
          description: 'What organizations are actively willing to pay for.',
          natural: 4,
          practical: 4,
          measurable: 4,
          total_score: 12,
        },
        unique_positioning: {
          name:
            patterns[2]?.name ||
            'Transformational Change',
          description: 'The combination that is hard to replace.',
          natural: 4,
          practical: 4,
          measurable: 3,
          total_score: 11,
        },
      }

      set({ skillsCanvas: skills, loading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate skills canvas',
        loading: false,
      })
    }
  },

  saveProgress: async () => {
    try {
      const { currentQuestionnaire, responses } = get()

      if (!currentQuestionnaire) return

      const { error } = await supabase
        .from('questionnaires')
        .update({ responses, updated_at: new Date().toISOString() })
        .eq('id', currentQuestionnaire.id)

      if (error) throw error
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save',
      })
    }
  },

  completeQuestionnaire: async () => {
    set({ loading: true })
    try {
      const { currentQuestionnaire, responses, skillsCanvas } = get()

      if (!currentQuestionnaire) return

      const { error } = await supabase
        .from('questionnaires')
        .update({
          responses,
          skills_canvas: skillsCanvas,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentQuestionnaire.id)

      if (error) throw error

      set({ loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete',
        loading: false,
      })
    }
  },

  createVersion: async (userId: string, questId: string) => {
    set({ loading: true })
    try {
      const { responses, skillsCanvas } = get()

      // Get current max version
      const { data: existing } = await supabase
        .from('questionnaires')
        .select('version')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .order('version', { ascending: false })
        .limit(1)

      const newVersion = (existing?.[0]?.version || 0) + 1

      const { data: newQuestionnaire } = await supabase
        .from('questionnaires')
        .insert([
          {
            user_id: userId,
            quest_id: questId,
            version: newVersion,
            responses,
            skills_canvas: skillsCanvas,
          },
        ])
        .select()
        .single()

      set({ currentQuestionnaire: newQuestionnaire, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create version',
        loading: false,
      })
    }
  },

  reset: () => {
    set({
      currentQuestionnaire: null,
      responses: {},
      currentRound: 1,
      patterns: [],
      skillsCanvas: null,
      loading: false,
      error: null,
    })
  },
}))
