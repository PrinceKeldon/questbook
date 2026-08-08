-- ML Training Data Schema
-- Collects questionnaire outputs and outcomes for future model training

-- Track what skills were generated (snapshot for comparison)
CREATE TABLE IF NOT EXISTS skill_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id),
  version INT NOT NULL,
  
  -- Generated skills (denormalized for easy ML feature extraction)
  skill_1_name TEXT NOT NULL,
  skill_1_natural INT,
  skill_1_practical INT,
  skill_1_measurable INT,
  skill_1_confidence INT,
  
  skill_2_name TEXT NOT NULL,
  skill_2_natural INT,
  skill_2_practical INT,
  skill_2_measurable INT,
  skill_2_confidence INT,
  
  skill_3_name TEXT NOT NULL,
  skill_3_natural INT,
  skill_3_practical INT,
  skill_3_measurable INT,
  skill_3_confidence INT,
  
  -- Algorithm metadata
  answer_completeness DECIMAL(3,2), -- 0-1: % of 16 questions answered
  avg_answer_length INT,
  response_consistency DECIMAL(3,2), -- 0-1: cross-round consistency score
  
  -- PDF download tracking
  pdf_downloaded_at TIMESTAMP,
  pdf_filename TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Immediate feedback after quiz (0-7 days)
CREATE TABLE IF NOT EXISTS immediate_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id),
  
  -- Accuracy: How well did these skills describe you? (1-5)
  accuracy_score INT CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  accuracy_comment TEXT,
  
  -- Usefulness: Did this help clarify your direction? (1-5)
  usefulness_score INT CHECK (usefulness_score >= 1 AND usefulness_score <= 5),
  usefulness_comment TEXT,
  
  -- Action intent: What will you do with this? (multiple choice)
  action_intent TEXT, -- "share_with_mentor", "update_linkedin", "career_conversation", "none", "other"
  action_intent_other TEXT,
  
  -- Accuracy adjustments: Did they correct any skills?
  corrected_skill_1 TEXT, -- What skill should #1 actually be?
  corrected_skill_2 TEXT,
  corrected_skill_3 TEXT,
  
  -- Additional comments
  general_feedback TEXT,
  
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3-month follow-up (sent via email, auto-tracked link)
CREATE TABLE IF NOT EXISTS followup_3mo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id),
  
  -- Action taken
  action_taken TEXT, -- "got_hired", "started_business", "changed_role", "shared_with_network", "none", "other"
  action_taken_description TEXT,
  
  -- Which skills did you use?
  used_skill_1 BOOLEAN DEFAULT FALSE,
  used_skill_2 BOOLEAN DEFAULT FALSE,
  used_skill_3 BOOLEAN DEFAULT FALSE,
  used_other_skill TEXT,
  
  -- Success metrics
  relevant_to_career INT CHECK (relevant_to_career >= 1 AND relevant_to_career <= 5),
  accuracy_updated INT CHECK (accuracy_updated >= 1 AND accuracy_updated <= 5),
  
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6-month outcomes (final data for ML training)
CREATE TABLE IF NOT EXISTS outcome_6mo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id),
  
  -- Outcome metrics
  skill_alignment_score INT CHECK (skill_alignment_score >= 1 AND skill_alignment_score <= 5),
  -- "How aligned is your current work with the detected skills?" 1=not at all, 5=perfect fit
  
  career_satisfaction INT CHECK (career_satisfaction >= 1 AND career_satisfaction <= 5),
  -- "Overall career satisfaction right now" 1=very dissatisfied, 5=very satisfied
  
  success_in_detected_areas INT CHECK (success_in_detected_areas >= 1 AND success_in_detected_areas <= 5),
  -- "Success using the detected skills" 1=struggled, 5=thriving
  
  -- Optional: Revenue/impact metrics
  revenue_impact INT, -- $0-$1M: did detected skills help generate revenue?
  promotion_or_raise BOOLEAN, -- Did this info help you get promoted or raise?
  new_opportunity BOOLEAN, -- Did this help you spot a new opportunity?
  
  -- Skills truly used (final assessment)
  primary_skill_used TEXT, -- Which skill is actually most valuable to you?
  primary_skill_story TEXT, -- How has this skill impacted your work?
  
  -- Feedback on algorithm accuracy
  algorithm_accuracy_final INT CHECK (algorithm_accuracy_final >= 1 AND algorithm_accuracy_final <= 5),
  -- "In retrospect, how accurate were the detected skills?"
  
  what_was_off TEXT, -- "If not perfect, what did algorithm miss?"
  
  -- Would they recommend?
  recommend_to_others INT CHECK (recommend_to_others >= 0 AND recommend_to_others <= 10),
  -- NPS-style: "How likely to recommend Questbook to a friend?"
  
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email campaign tracking
CREATE TABLE IF NOT EXISTS outcome_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id),
  
  email_type TEXT NOT NULL, -- "immediate", "3mo", "6mo"
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  feedback_submitted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Summary view for ML training data preparation
CREATE VIEW ml_training_data AS
SELECT
  q.id as questionnaire_id,
  q.user_id,
  q.responses,
  sg.skill_1_name,
  sg.skill_1_natural,
  sg.skill_1_practical,
  sg.skill_1_measurable,
  sg.skill_1_confidence,
  sg.skill_2_name,
  sg.skill_2_natural,
  sg.skill_2_practical,
  sg.skill_2_measurable,
  sg.skill_2_confidence,
  sg.skill_3_name,
  sg.skill_3_natural,
  sg.skill_3_practical,
  sg.skill_3_measurable,
  sg.skill_3_confidence,
  sg.avg_answer_length,
  sg.response_consistency,
  imf.accuracy_score,
  imf.usefulness_score,
  imf.action_intent,
  f3.used_skill_1,
  f3.used_skill_2,
  f3.used_skill_3,
  f3.action_taken,
  o6.skill_alignment_score,
  o6.career_satisfaction,
  o6.success_in_detected_areas,
  o6.primary_skill_used,
  o6.algorithm_accuracy_final,
  COALESCE(imf.submitted_at IS NOT NULL, FALSE) as has_immediate_feedback,
  COALESCE(f3.submitted_at IS NOT NULL, FALSE) as has_3mo_feedback,
  COALESCE(o6.submitted_at IS NOT NULL, FALSE) as has_6mo_feedback
FROM questionnaires q
LEFT JOIN skill_generations sg ON q.id = sg.questionnaire_id
LEFT JOIN immediate_feedback imf ON q.id = imf.questionnaire_id
LEFT JOIN followup_3mo f3 ON q.id = f3.questionnaire_id
LEFT JOIN outcome_6mo o6 ON q.id = o6.questionnaire_id;

-- Enable RLS
ALTER TABLE skill_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE immediate_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_3mo ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_6mo ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users see their own data, admin sees all)
CREATE POLICY "Users see own feedback"
  ON immediate_feedback FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt()->>'email' LIKE '%@keldontech.com');

CREATE POLICY "Users see own 3mo"
  ON followup_3mo FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt()->>'email' LIKE '%@keldontech.com');

CREATE POLICY "Users see own 6mo"
  ON outcome_6mo FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt()->>'email' LIKE '%@keldontech.com');

-- Indexes for performance
CREATE INDEX idx_skill_generations_questionnaire_id ON skill_generations(questionnaire_id);
CREATE INDEX idx_immediate_feedback_user_id ON immediate_feedback(user_id);
CREATE INDEX idx_immediate_feedback_submitted_at ON immediate_feedback(submitted_at);
CREATE INDEX idx_followup_3mo_user_id ON followup_3mo(user_id);
CREATE INDEX idx_outcome_6mo_user_id ON outcome_6mo(user_id);
CREATE INDEX idx_outcome_emails_user_id ON outcome_emails(user_id);
CREATE INDEX idx_outcome_emails_sent_at ON outcome_emails(sent_at);
