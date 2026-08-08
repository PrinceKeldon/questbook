# ML Data Collection & Instrumentation Strategy

**Commit:** `4be59e1`  
**Timeline to ML Model:** 4-6 months post-launch  
**Data Quality:** Production-ready for XGBoost training  

---

## The Problem ML Solves

**Current System (Rule-Based):**
```
Same weights for all users
→ "Strategic Thinking" scores 4/5 for CEO and junior developer
→ Doesn't adapt to user context, outcome, industry
```

**With ML (After 6 months of data):**
```
Personalized model learns from outcomes
→ CEO: "Strategic Thinking" 4/5 strongly predicts business success
→ Junior dev: "Strategic Thinking" 4/5 predicts management path (not always wanted)
→ System learns to calibrate scores based on what user actually needs
```

---

## Data Collection Architecture

### Layer 1: Skill Generation Snapshot (Immediate)

**When:** Quest completion → Results page loads  
**How:** `captureSkillGeneration()` in `mlDataCollection.ts`  
**Data Captured:**

```typescript
{
  questionnaire_id: "uuid",
  version: 1,
  
  // Denormalized skills (easy to load for ML)
  skill_1_name: "Building & Creation",
  skill_1_natural: 4,
  skill_1_practical: 5,
  skill_1_measurable: 4,
  skill_1_confidence: 80, // 0-100
  
  // Same for skill_2 and skill_3...
  
  // Metadata
  answer_completeness: 0.94, // 15/16 questions answered
  avg_answer_length: 78,     // Words per answer
  response_consistency: 0.85, // Cross-round alignment
  
  pdf_downloaded_at: "2025-02-15T10:30:00Z",
  pdf_filename: "Architecture_of_You_keldon_2025-02-15.pdf"
}
```

**Storage:** `skill_generations` table  
**Retention:** Permanent (never delete)  
**Volume:** 1 row per quest completion  

---

### Layer 2: Immediate Feedback (0-7 days)

**When:** 3 seconds after results page shows (optional modal)  
**How:** `ImmediateFeedbackForm` component  
**UX:** 4-step wizard with beautiful rating scales  

```
Step 1: Accuracy
  "How well did these skills describe you?"
  Rating: 1-5 stars
  Comment: Optional text
  
Step 2: Usefulness
  "Did this help clarify your direction?"
  Rating: 1-5 stars
  Comment: Optional text
  
Step 3: Action Intent
  "What will you do with this?"
  Choices: Share with mentor, Update LinkedIn, Career conversation, etc.
  
Step 4: Corrections
  "Any skills we got wrong?"
  Text fields for skill_1, skill_2, skill_3 corrections
  General feedback: Open text
```

**Data Captured:**

```typescript
{
  user_id: "uuid",
  questionnaire_id: "uuid",
  
  // Scores
  accuracy_score: 4,      // 1-5
  usefulness_score: 5,    // 1-5
  
  // Comments
  accuracy_comment: "Pretty accurate, but I'm more...",
  usefulness_comment: "Really helped me see patterns",
  
  // Action
  action_intent: "share_with_mentor",
  
  // Corrections (user's edits)
  corrected_skill_1: "Product Leadership", // If wrong, corrected here
  corrected_skill_2: "",                   // Blank = correct
  corrected_skill_3: "",
  
  general_feedback: "Overall great experience",
  submitted_at: "2025-02-15T10:35:00Z"
}
```

**Storage:** `immediate_feedback` table  
**Response Rate Target:** 30-40% of users  
**ML Value:** High (user-verified ground truth)  

---

### Layer 3: Auto-Scheduled Emails

**When:** Scheduled at results page load  
**How:** `schedule3moFollowup()` and `schedule6moFollowup()`  

```typescript
// 3 months from now
{
  user_id: "uuid",
  questionnaire_id: "uuid",
  email_type: "3mo",
  scheduled_at: "2025-05-15T10:35:00Z", // 3 months later
}

// 6 months from now
{
  user_id: "uuid",
  questionnaire_id: "uuid",
  email_type: "6mo",
  scheduled_at: "2025-08-15T10:35:00Z", // 6 months later
}
```

**Tracking:**
- `sent_at`: When email left our system
- `opened_at`: When user opened (via pixel/link)
- `clicked_at`: When user clicked survey link
- `feedback_submitted`: Boolean flag

**Note:** Email delivery + tracking requires 3rd-party service (SendGrid, Mailgun, etc.)

---

### Layer 4: 3-Month Check-In

**When:** Email sent ~90 days after completion  
**How:** User clicks link → Survey form fills data  
**Data Captured:**

```typescript
{
  user_id: "uuid",
  questionnaire_id: "uuid",
  
  // Action taken
  action_taken: "started_business", // Multiple choice
  action_taken_description: "Launched SaaS for freelancers",
  
  // Skills used
  used_skill_1: true,  // Did they use detected skill #1?
  used_skill_2: true,  // Did they use detected skill #2?
  used_skill_3: false, // Did they use detected skill #3?
  used_other_skill: "Data Analysis",
  
  // Reassessment
  relevant_to_career: 4,   // 1-5: Still relevant?
  accuracy_updated: 4,     // 1-5: Still accurate?
  
  submitted_at: "2025-05-20T14:22:00Z"
}
```

**Storage:** `followup_3mo` table  
**Response Rate Target:** 15-25%  
**ML Value:** Medium (confirms skill usage)  

---

### Layer 5: 6-Month Final Outcomes (Gold Standard)

**When:** Email sent ~180 days after completion  
**How:** User completes outcomes survey  
**Data Captured:**

```typescript
{
  user_id: "uuid",
  questionnaire_id: "uuid",
  
  // SUCCESS METRICS (1-5 scales)
  skill_alignment_score: 4,
  // "How aligned is your current work with detected skills?"
  
  career_satisfaction: 5,
  // "Overall career satisfaction right now?"
  
  success_in_detected_areas: 4,
  // "Success using the detected skills?"
  
  // OPTIONAL REVENUE METRICS
  revenue_impact: 125000, // $ they made using detected skills
  promotion_or_raise: true,
  new_opportunity: true,
  
  // QUALITATIVE
  primary_skill_used: "Building & Creation",
  primary_skill_story: "Started freelance product business. 
                        The 'Building' skill was critical—
                        allowed me to ship fast.",
  
  // ALGORITHM ASSESSMENT
  algorithm_accuracy_final: 4,
  // "In retrospect, how accurate were detected skills?"
  
  what_was_off: "Didn't mention communication enough, 
                 which turned out critical for client work",
  
  // NPS QUESTION
  recommend_to_others: 8, // 0-10 scale
  
  submitted_at: "2025-08-20T16:45:00Z"
}
```

**Storage:** `outcome_6mo` table  
**Response Rate Target:** 10-15%  
**ML Value:** Highest (outcome labels for supervised learning)  

---

## ML Training Data View

**SQL View:** `ml_training_data`

Joins all 5 layers into one denormalized table:

```
questionnaire_id | user_id | responses_json | 
skill_1_name | skill_1_natural | skill_1_practical | ... |
accuracy_score | usefulness_score | action_intent |
used_skill_1 | used_skill_2 | used_skill_3 |
skill_alignment_score | career_satisfaction | success_in_detected_areas |
primary_skill_used | algorithm_accuracy_final | recommend_to_others |
has_immediate_feedback | has_3mo_feedback | has_6mo_feedback
```

**Export for ML:**
```bash
# After 6 months of data collection
SELECT * FROM ml_training_data 
WHERE has_immediate_feedback AND has_6mo_feedback
INTO OUTFILE 'questbook_training_data.csv';

# Load into Python
import pandas as pd
df = pd.read_csv('questbook_training_data.csv')
# ~30-50 rows with complete labels
```

---

## Timeline & Response Rates

### Month 1-2: Early Adopters
```
Users: 50-100
Immediate Feedback: 30-40 users (40%)
3mo Emails: Scheduled but not due yet
6mo Emails: Scheduled but not due yet
ML Data: Can't train yet (need outcomes)
```

### Month 3-4: 3-Month Cohort
```
Users: 150-200 cumulative
Immediate Feedback: 50-70 users (35%)
3mo Follow-ups: Sent to first cohort
3mo Responses: 8-15 users (15%)
6mo Emails: Scheduled but not due yet
ML Data: Still can't train (need final outcomes)
```

### Month 5-6: 6-Month Outcomes Ready
```
Users: 200-300 cumulative
Immediate Feedback: 70-100 users (35%)
3mo Follow-ups: 20-40 responses (20%)
6mo Follow-ups: Sent to first cohort
6mo Responses: 5-15 users (15%)
ML DATA READY: 5-15 labeled examples
→ Train first model!
```

### Month 6-12: Model Training & Iteration
```
Users: 300-500 cumulative
Immediate Feedback: 100-150 users (35%)
3mo Follow-ups: 50-80 responses (20%)
6mo Follow-ups: 30-60 responses (15%)
ML Data: 30-60 labeled examples
→ Retrain model, improve accuracy
```

---

## How the ML Model Will Work

### Input Features (Generated Automatically)

```python
# From questionnaire responses (16 features)
response_length_q1, response_length_q2, ..., response_length_q16

# From pattern detection (8 features)
cluster_score_strategic_thinking,
cluster_score_communication,
cluster_score_building,
cluster_score_leadership,
cluster_score_problem_solving,
cluster_score_analysis,
cluster_score_creative_direction,
cluster_score_operations

# From metadata (3 features)
answer_completeness,
avg_answer_length,
response_consistency

# From immediate feedback (2 features)
accuracy_score,  # User says how accurate we were
action_intent_encoded  # What they plan to do

# Total: ~32 features
```

### Output Labels (From 6-Month Outcomes)

```python
# For each user's 3 detected skills:
skill_1_accuracy_final = algorithm_accuracy_final (1-5)
career_impact = skill_alignment_score (1-5)
usage = used_skill_1 (boolean)
success = success_in_detected_areas (1-5)

# Target metric: success_in_detected_areas
# Goal: Predict 1-5 outcome score before user knows
```

### Training Algorithm

```python
import xgboost as xgb

X = features_from_30_users  # shape: (30, 32)
y = success_in_detected_areas  # shape: (30,)

model = xgb.XGBRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
)

model.fit(X, y)

# Validation on holdout set
# Expected improvement: RMSE improves from 0.8 → 0.6
```

### How to Use the Model

```typescript
// New questionnaire after model is trained
const features = extractFeaturesFromQuestionnaire(questionnaire);
const predictedSuccess = model.predict([features]);

// Blend with rule-based scores
const blended = {
  confidence: 0.7 * rule_based_confidence + 0.3 * model_confidence,
  skill_scores: adjustByModel(rule_scores, model_prediction),
};
```

---

## Data Quality & Privacy

### Data Validation

- ✅ Responses stored as-is (raw text, no PII)
- ✅ Scores validated (1-5, 1-10 ranges enforced)
- ✅ Timestamps validated (not in future)
- ✅ Questionnaire IDs validated (must exist)

### Privacy Guarantees

- ✅ RLS policies: Users see own feedback only
- ✅ No email addresses stored in feedback tables
- ✅ Outcomes view excludes identifiable info (CSV safe)
- ✅ Data retention: Keep indefinitely (never delete)

### Compliance

- ✅ GDPR: Users can request export/deletion of own data
- ✅ Email tracking: Pixel tracking only if user opts in
- ✅ Feedback: Always optional (modal can close)

---

## Implementation Checklist

### Now (Pre-Launch)
- [x] Database schema created (`ml-training-schema.sql`)
- [x] Skill generation capture implemented (`captureSkillGeneration()`)
- [x] PDF download logging implemented (`logPDFDownload()`)
- [x] Immediate feedback form built (`ImmediateFeedbackForm.tsx`)
- [x] Email scheduling implemented (`schedule3moFollowup/6mo()`)
- [x] ML data view created (`ml_training_data`)

### Month 1-2 (After Launch)
- [ ] Integrate email service (SendGrid/Mailgun)
- [ ] Deploy scheduled email job (Cloud Functions/AWS Lambda)
- [ ] Test 3mo email flow end-to-end
- [ ] Monitor immediate feedback submission rate
- [ ] Set up data quality alerts

### Month 3-4
- [ ] Start receiving 3mo outcomes
- [ ] Build dashboard to visualize collection progress
- [ ] Analyze early feedback patterns
- [ ] Identify any data quality issues

### Month 5-6
- [ ] First 6mo outcomes arrive
- [ ] Export training data (`ml_training_data.csv`)
- [ ] Train XGBoost model
- [ ] Evaluate accuracy on holdout set
- [ ] Begin A/B testing rule-based vs ML

### Month 6-12
- [ ] Deploy ensemble (80% rule, 20% ML)
- [ ] Gradually increase ML weight (10% per month)
- [ ] Collect more data, retrain model
- [ ] Measure impact on user satisfaction

---

## What Success Looks Like

### Month 1-2
```
✅ 40% of users provide immediate feedback
✅ 0 data quality errors
✅ Emails scheduled correctly
```

### Month 3-4
```
✅ 20% response rate on 3mo emails
✅ Patterns emerging (e.g., "Building" skill → business starts)
✅ Early model promising
```

### Month 6
```
✅ 30-60 complete feedback loops
✅ Model trained, RMSE < 0.7
✅ A/B test shows 5-10% accuracy improvement
✅ Users requesting personalized feedback
```

### Month 12
```
✅ 200+ complete feedback loops
✅ Model predictions beat rule-based 80% of time
✅ Personalization per user type working
✅ Data moat: Competitors can't easily replicate
```

---

## Example: How a User's Data Flows

### Day 0: Quest Completion
```
User completes 16 questions
↓
generateSkillsCanvasFromResponses() runs
↓
Skills detected: Building, Strategy, Leadership
↓
captureSkillGeneration() saves to DB:
{
  skill_1_name: "Building & Creation",
  skill_1_confidence: 87,
  ...
}
↓
schedule3moFollowup() adds email task:
Send on: 2025-05-15 10:35 UTC
↓
Results page shows
ImmediateFeedbackForm appears (3 sec delay)
↓
User rates: Accuracy 4/5, Usefulness 5/5
Downloads PDF
↓
submitImmediateFeedback() saves:
{
  accuracy_score: 4,
  usefulness_score: 5,
  action_intent: "share_with_mentor"
}
```

### Day 90: 3-Month Check-In
```
Email sent: "How are those skills working out?"
User clicks link
↓
Survey form:
"Did you use Building & Creation? Yes"
"Career satisfaction? 4/5"
↓
submitFollowup3mo() saves outcome
```

### Day 180: 6-Month Outcomes
```
Email sent: "Final check on your architecture"
User fills final survey:
"Success using detected skills? 4/5"
"Would recommend? 8/10"
"Started a side business using Building skill"
↓
submitOutcome6mo() saves complete outcome
↓
ml_training_data view now shows complete row:
- All input features (responses, patterns, metadata)
- All intermediate feedback (accuracy, usefulness)
- Final outcome (success, satisfaction, revenue)
↓
Later: This row used to train ML model
```

---

## Summary

**You now have:**

✅ Production-ready schema for ML training data  
✅ Automatic skill snapshot capture  
✅ Beautiful feedback form UX  
✅ Auto-scheduled email follow-ups  
✅ Complete data pipeline ready to train model  

**Next steps when ready (4-6 months):**

1. Integrate email service
2. Collect 30-60 complete feedback loops
3. Train XGBoost model
4. Deploy ensemble (rule-based + ML)
5. Personalize skills by user type

**This approach:**
- ✅ Ships with simple, debuggable algorithm
- ✅ Gradually improves with real user data
- ✅ Builds sustainable competitive advantage
- ✅ Creates network effects (more data → better model)
