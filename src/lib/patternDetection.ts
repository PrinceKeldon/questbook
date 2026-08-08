// Pattern Detection Engine
// Extracts meaningful skills from 16-question responses with semantic clustering

interface PatternScore {
  skill: string
  score: number
  frequency: number
  rounds: Set<number>
  keywords: string[]
  depth: number // Average answer length pointing to this skill
}

interface SemanticCluster {
  name: string
  keywords: string[]
  weight: number // How much to weight this cluster
}

// Semantic skill clusters - group related concepts together
const SKILL_CLUSTERS: SemanticCluster[] = [
  {
    name: 'Strategic Thinking',
    keywords: [
      'strategy', 'plan', 'vision', 'direction', 'roadmap', 'goal', 'objective',
      'thinking', 'analysis', 'research', 'understand', 'insight', 'pattern',
      'architecture', 'design', 'system', 'framework', 'approach', 'method',
      'decision', 'evaluate', 'assess', 'judge', 'solve',
    ],
    weight: 1.0,
  },
  {
    name: 'Communication',
    keywords: [
      'write', 'speak', 'explain', 'tell', 'teach', 'train', 'coach',
      'communicate', 'messaging', 'clarity', 'clear', 'articulate', 'present',
      'story', 'narrative', 'words', 'language', 'copy', 'brand', 'voice',
      'listen', 'understand', 'connect',
    ],
    weight: 0.95,
  },
  {
    name: 'Building & Creation',
    keywords: [
      'build', 'create', 'make', 'develop', 'launch', 'ship', 'product',
      'code', 'design', 'craft', 'construct', 'produce', 'invent',
      'entrepreneur', 'founder', 'startup', 'business', 'project',
      'implement', 'execute', 'deliver',
    ],
    weight: 1.0,
  },
  {
    name: 'Leadership',
    keywords: [
      'lead', 'manage', 'lead', 'team', 'people', 'group', 'culture',
      'direction', 'influence', 'inspire', 'motivate', 'empower',
      'responsibility', 'authority', 'decision', 'guide', 'mentor',
      'hire', 'recruit', 'develop', 'leader',
    ],
    weight: 0.9,
  },
  {
    name: 'Problem Solving',
    keywords: [
      'solve', 'fix', 'solve', 'problem', 'issue', 'challenge', 'struggle',
      'stuck', 'help', 'support', 'resolve', 'handle', 'deal', 'overcome',
      'trouble', 'difficult', 'hard', 'tricky', 'complex', 'improve',
    ],
    weight: 1.0,
  },
  {
    name: 'Analysis & Research',
    keywords: [
      'analyze', 'research', 'data', 'numbers', 'metrics', 'measure', 'test',
      'investigate', 'explore', 'discover', 'find', 'identify', 'detect',
      'observe', 'notice', 'see', 'understand', 'insight', 'reason',
      'logic', 'rational', 'think', 'question',
    ],
    weight: 0.9,
  },
  {
    name: 'Creative Direction',
    keywords: [
      'creative', 'creative', 'idea', 'imagine', 'envision', 'concept',
      'art', 'design', 'aesthetic', 'beautiful', 'style', 'taste',
      'vision', 'unique', 'different', 'original', 'fresh', 'innovative',
      'music', 'visual', 'experience', 'intuition', 'feeling',
    ],
    weight: 0.95,
  },
  {
    name: 'Operations & Systems',
    keywords: [
      'organize', 'organize', 'system', 'process', 'efficient', 'workflow',
      'operational', 'logistics', 'planning', 'structure', 'order',
      'detail', 'precision', 'accuracy', 'manage', 'coordinate', 'implement',
      'tools', 'automation', 'optimize', 'scale',
    ],
    weight: 0.85,
  },
]

// Question category weights for round-specific signals
const QUESTION_CATEGORY_WEIGHT: Record<string, number> = {
  problems: 0.95,    // Direct signal of what they solve
  outcomes: 1.0,     // Clear outcome signals
  flow: 0.9,         // Energy alignment signal
  observation: 1.0,  // What they uniquely notice
  ease: 0.95,        // Natural strength signal
  instinct: 0.9,     // Gut-level decision signal
  drain: -0.7,       // Anti-signal (avoid this)
  energy: 1.0,       // Strong positive signal
  people: 0.95,      // Network/relationship signal
  compliments: 1.0,  // External validation
  essence: 0.95,     // Core value without credentials
  measurable: 1.0,   // Concrete outcomes
  consensus: 1.0,    // Peer validation
  irreplaceable: 0.95, // Unique value signal
  mastery: 0.9,      // Depth of skill
  hidden: 0.85,      // Untapped potential
}

// Round weights (market signals are strongest, natural patterns second)
const ROUND_WEIGHTS: Record<number, number> = {
  1: 0.9,  // Pattern Finder - shows natural talent
  2: 0.8,  // Friction Test - shows sustainability
  3: 1.0,  // Market Reality - strongest signal of value
}

export function detectPatterns(
  responses: Record<string, string>,
  questions: Array<{ id: string; round: number; category: string }>
): string[] {
  const patternScores: Map<string, PatternScore> = new Map()

  // Process each response
  questions.forEach((q) => {
    const answer = responses[q.id] || ''
    if (!answer.trim()) return

    const answerLower = answer.toLowerCase()
    const answerLength = answer.split(/\s+/).length
    const roundWeight = ROUND_WEIGHTS[q.round] || 1.0
    const categoryWeight = QUESTION_CATEGORY_WEIGHT[q.category] || 0.8

    // Score against each skill cluster
    SKILL_CLUSTERS.forEach((cluster) => {
      const matchCount = cluster.keywords.filter((kw) =>
        answerLower.includes(kw)
      ).length

      if (matchCount > 0) {
        const score =
          matchCount *
          cluster.weight *
          categoryWeight *
          roundWeight *
          (answerLength / 100) // Normalize by answer depth

        if (!patternScores.has(cluster.name)) {
          patternScores.set(cluster.name, {
            skill: cluster.name,
            score: 0,
            frequency: 0,
            rounds: new Set(),
            keywords: [],
            depth: 0,
          })
        }

        const pattern = patternScores.get(cluster.name)!
        pattern.score += score
        pattern.frequency += matchCount
        pattern.rounds.add(q.round)
        pattern.depth = (pattern.depth + answerLength) / 2
        pattern.keywords = Array.from(
          new Set([
            ...pattern.keywords,
            ...cluster.keywords.filter((kw) => answerLower.includes(kw)),
          ])
        ).slice(0, 5)
      }
    })
  })

  // Consistency bonus: skills appearing across multiple rounds score higher
  patternScores.forEach((pattern) => {
    const consistencyBonus = (pattern.rounds.size / 3) * 0.3 // Up to 30% bonus
    pattern.score *= 1 + consistencyBonus
  })

  // Sort and return top 3
  const topPatterns = Array.from(patternScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => p.skill)

  return topPatterns.length > 0
    ? topPatterns
    : ['Leadership', 'Problem-Solving', 'Strategic Thinking']
}

// Confidence scoring for Skills Canvas (0-100)
export function calculateConfidenceScore(
  responses: Record<string, string>,
  skill: string,
  questions: Array<{ id: string; round: number; category: string }>
): number {
  const answeredCount = Object.values(responses).filter(
    (a) => a?.trim().length > 0
  ).length
  const totalQuestions = questions.length
  const completionRate = (answeredCount / totalQuestions) * 100

  // Higher completion + longer answers = higher confidence
  const avgAnswerLength =
    Object.values(responses).reduce((sum, a) => sum + a.length, 0) /
    answeredCount
  const depthScore = Math.min((avgAnswerLength / 200) * 100, 100)

  // Confidence = 60% completion + 40% depth
  return Math.round(completionRate * 0.6 + depthScore * 0.4)
}

// Generate skill descriptions based on detected patterns
export function generateSkillDescription(
  skill: string,
  responses: Record<string, string>
): string {
  const skillDescriptions: Record<string, string> = {
    'Strategic Thinking':
      'You naturally see the big picture, plan systems, and architect solutions that work at scale.',
    'Communication':
      'You translate complex ideas into clear messages that resonate and inspire action.',
    'Building & Creation':
      'You turn ideas into reality, shipping products and businesses that didn\'t exist before.',
    'Leadership':
      'You bring people together, set direction, and create cultures where others thrive.',
    'Problem Solving':
      'You diagnose what\'s broken and engineer solutions that actually stick.',
    'Analysis & Research':
      'You uncover hidden patterns in data and dig until you find the root truth.',
    'Creative Direction':
      'You have a distinctive vision for what\'s possible and the taste to execute it.',
    'Operations & Systems':
      'You design workflows and processes that scale, optimize, and handle complexity.',
  }

  return (
    skillDescriptions[skill] ||
    `You excel at ${skill.toLowerCase()} in ways that create measurable value.`
  )
}
