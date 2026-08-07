export interface User {
  id: string
  email: string
  subscription_status: 'free' | 'active' | 'cancelled'
  created_at: string
}

export interface Quest {
  id: string
  slug: string
  title: string
  description: string
  version: string
  is_free: boolean
  module_order: number
  created_at: string
}

export interface QuestModule {
  id: string
  quest_id: string
  module_order: number
  title: string
  questions: Question[]
  is_free: boolean
}

export interface Question {
  id: string
  number: number
  text: string
  hint?: string
  round: 1 | 2 | 3
  category: string
}

export interface QuestionnaireResponse {
  id: string
  user_id: string
  quest_id: string
  version: number
  responses: Record<string, string>
  patterns_detected: Pattern[]
  skills_canvas: SkillsCanvas | null
  positioning_statement: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Pattern {
  name: string
  occurrences: number
  questions: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export interface SkillsCanvas {
  innate_strength: Skill
  marketable_skill: Skill
  unique_positioning: Skill
}

export interface Skill {
  name: string
  description: string
  natural: number
  practical: number
  measurable: number
  total_score: number
}

export interface Subscription {
  user_id: string
  stripe_subscription_id: string
  status: 'active' | 'paused' | 'cancelled'
  modules_unlocked: string[]
  current_period_end: string
}

export interface PositioningStatement {
  one_line: string
  bio: string
  proof: string
}

export interface SevenDayPlan {
  step_1: string
  step_2: string
  step_3: string
  step_4: string
  step_5: string
}
