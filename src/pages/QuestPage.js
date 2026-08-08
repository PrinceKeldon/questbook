import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuestStore } from '@/store/questStore';
import { supabase } from '@/lib/supabase';
import RoundTransition from '@/components/RoundTransition';
import QuestionCard from '@/components/QuestionCard';
import RoundProgress from '@/components/RoundProgress';
import SaveIndicator from '@/components/SaveIndicator';
const QUEST_QUESTIONS = [
    {
        id: 'q1',
        number: 1,
        text: "When someone says 'I'm stuck,' what kind of problem are they usually asking you to help with?",
        hint: "Not what you'd like them to ask. What do they actually ask?",
        round: 1,
        category: 'problems',
    },
    {
        id: 'q2',
        number: 2,
        text: "Think about the last ten people you've genuinely helped. What did they walk away with?",
        hint: 'Examples: clarity, confidence, a website, a song, a strategy, connections, a system, an introduction, better writing.',
        round: 1,
        category: 'outcomes',
    },
    {
        id: 'q3',
        number: 3,
        text: 'What kinds of work make you completely lose track of time?',
        hint: "Not because they're fun — because they pull you in.",
        round: 1,
        category: 'flow',
    },
    {
        id: 'q4',
        number: 4,
        text: 'What do you notice that most people seem blind to?',
        hint: 'Could be in people, products, businesses, or culture.',
        round: 1,
        category: 'observation',
    },
    {
        id: 'q5',
        number: 5,
        text: 'When have you been paid, or repeatedly thanked, for something that felt almost unfairly easy?',
        hint: 'Those moments are the most valuable data.',
        round: 1,
        category: 'ease',
    },
    {
        id: 'q6',
        number: 6,
        text: "Someone hands you £50,000. You have 90 days. You can't spend it on ads. Turn it into £150,000. What would you build, and why that?",
        round: 1,
        category: 'instinct',
    },
    {
        id: 'q7',
        number: 7,
        text: "What work drains you, even if you're good at it?",
        round: 2,
        category: 'drain',
    },
    {
        id: 'q8',
        number: 8,
        text: 'What work energizes you, even when nobody is watching?',
        round: 2,
        category: 'energy',
    },
    {
        id: 'q9',
        number: 9,
        text: 'What kinds of people seem to "find" you naturally?',
        hint: 'Artists, founders, developers, executives, community leaders, students?',
        round: 2,
        category: 'people',
    },
    {
        id: 'q10',
        number: 10,
        text: "What compliments have you heard so many times that you've stopped believing they're special?",
        round: 2,
        category: 'compliments',
    },
    {
        id: 'q11',
        number: 11,
        text: "If every qualification disappeared tomorrow — no CV, no degree, no title — how would you convince someone to hire you?",
        round: 2,
        category: 'essence',
    },
    {
        id: 'q12',
        number: 12,
        text: 'What measurable change can you repeatedly create for someone else?',
        hint: 'Examples: launch faster, increase revenue, write clearer copy, grow a community, automate a task, connect the right people.',
        round: 3,
        category: 'measurable',
    },
    {
        id: 'q13',
        number: 13,
        text: "If you interviewed ten people you've worked with, what would all ten agree you're unusually good at?",
        round: 3,
        category: 'consensus',
    },
    {
        id: 'q14',
        number: 14,
        text: 'If you disappeared from a project tomorrow, what would be hardest to replace?',
        round: 3,
        category: 'irreplaceable',
    },
    {
        id: 'q15',
        number: 15,
        text: "What's the hardest thing you've learned that now feels effortless?",
        round: 3,
        category: 'mastery',
    },
    {
        id: 'q16',
        number: 16,
        text: 'People don\'t realize I can actually _______________.',
        round: 3,
        category: 'hidden',
    },
];
function generateSkillsCanvasFromResponses(responses) {
    const allText = Object.values(responses).join(' ').toLowerCase();
    const keywords = {};
    const words = allText.match(/\b[a-z]{4,}\b/g) || [];
    words.forEach((word) => {
        keywords[word] = (keywords[word] || 0) + 1;
    });
    const topKeywords = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    const extractedSkill1 = topKeywords[0] || 'Leadership';
    const extractedSkill2 = topKeywords[1] || 'Problem-Solving';
    const extractedSkill3 = topKeywords[2] || 'Strategic Thinking';
    return {
        innate_strength: {
            name: extractedSkill1.charAt(0).toUpperCase() + extractedSkill1.slice(1),
            description: 'What you naturally do better than most people, unprompted, before anyone pays you for it.',
            natural: Math.floor(Math.random() * 2) + 4,
            practical: Math.floor(Math.random() * 2) + 3,
            measurable: Math.floor(Math.random() * 2) + 3,
            total_score: 10,
        },
        marketable_skill: {
            name: extractedSkill2.charAt(0).toUpperCase() + extractedSkill2.slice(1),
            description: 'What organizations, founders, or clients are actively willing to pay for today.',
            natural: Math.floor(Math.random() * 2) + 4,
            practical: Math.floor(Math.random() * 2) + 4,
            measurable: Math.floor(Math.random() * 2) + 3,
            total_score: 12,
        },
        unique_positioning: {
            name: extractedSkill3.charAt(0).toUpperCase() + extractedSkill3.slice(1),
            description: 'The combination that is hard to replace — where your strength and your market skill meet.',
            natural: Math.floor(Math.random() * 2) + 4,
            practical: Math.floor(Math.random() * 2) + 4,
            measurable: Math.floor(Math.random() * 2) + 2,
            total_score: 11,
        },
    };
}
export default function QuestPage() {
    const { questId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { responses, updateResponse, initializeQuestionnaire, saveProgress } = useQuestStore();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showRoundTransition, setShowRoundTransition] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [nextRound, setNextRound] = useState(null);
    useEffect(() => {
        if (user?.id && questId) {
            initializeQuestionnaire(user.id, questId);
        }
    }, [user?.id, questId]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext();
            }
            else if (e.key === 'ArrowLeft') {
                handlePrevious();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex]);
    const currentQuestion = QUEST_QUESTIONS[currentQuestionIndex];
    const currentRound = currentQuestion.round;
    const questionsInRound = QUEST_QUESTIONS.filter((q) => q.round === currentRound);
    const completedInRound = questionsInRound.filter((q) => responses[q.id]?.trim()).length;
    const isLastQuestion = currentQuestionIndex === QUEST_QUESTIONS.length - 1;
    const isRoundLastQuestion = currentQuestionIndex === QUEST_QUESTIONS.findIndex((q, i, arr) => i === arr.length - 1 || arr[i + 1].round !== currentRound);
    const handleAnswer = (answer) => {
        updateResponse(currentQuestion.id, answer);
    };
    const autoSave = useCallback(async () => {
        if (!user?.id || !questId)
            return;
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            await saveProgress();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
        catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('idle');
        }
        finally {
            setIsSaving(false);
        }
    }, [saveProgress]);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(responses).length > 0) {
                autoSave();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [responses, autoSave]);
    const handleNext = () => {
        if (!responses[currentQuestion.id]?.trim()) {
            return;
        }
        if (isRoundLastQuestion && !isLastQuestion) {
            const nextRoundNum = currentRound + 1;
            setNextRound(nextRoundNum);
            setShowRoundTransition(true);
        }
        else if (currentQuestionIndex < QUEST_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };
    const handleRoundTransitionComplete = () => {
        setShowRoundTransition(false);
        const nextQuestionIndex = QUEST_QUESTIONS.findIndex((q) => q.round === nextRound);
        setCurrentQuestionIndex(nextQuestionIndex);
        setNextRound(null);
    };
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    const handleComplete = async () => {
        if (!user?.id || !questId)
            return;
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const skillsCanvas = generateSkillsCanvasFromResponses(responses);
            const { currentQuestionnaire } = useQuestStore.getState();
            if (!currentQuestionnaire)
                return;
            const { error } = await supabase
                .from('questionnaires')
                .update({
                responses,
                skills_canvas: skillsCanvas,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .eq('id', currentQuestionnaire.id);
            if (error)
                throw error;
            setSaveStatus('saved');
            setTimeout(() => {
                navigate(`/quest/${questId}/results/1`);
            }, 500);
        }
        catch (error) {
            console.error('Completion failed:', error);
            setSaveStatus('idle');
        }
        finally {
            setIsSaving(false);
        }
    };
    if (showRoundTransition) {
        return (_jsx(RoundTransition, { round: nextRound, onComplete: handleRoundTransitionComplete }));
    }
    const progressPercentage = Math.round(((currentQuestionIndex + 1) / QUEST_QUESTIONS.length) * 100);
    const canAdvance = responses[currentQuestion.id]?.trim().length > 0;
    return (_jsx("div", { className: "min-h-screen bg-paper py-8", children: _jsxs("div", { className: "max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: "eyebrow", children: "The Architecture of You" }), _jsxs("span", { className: "text-xs text-ink-soft font-mono", children: [currentQuestionIndex + 1, " / ", QUEST_QUESTIONS.length] })] }), _jsx("div", { className: "w-full bg-line-soft rounded-full h-1.5", children: _jsx("div", { className: "bg-teal h-1.5 rounded-full transition-all duration-300", style: { width: `${progressPercentage}%` } }) })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "eyebrow mb-2", children: ["Round ", currentRound, " of 3 \u2014", ' ', currentRound === 1
                                    ? 'The Pattern Finder'
                                    : currentRound === 2
                                        ? 'The Friction Test'
                                        : 'The Market Reality Test'] }), _jsx("p", { className: "text-sm text-ink-soft", children: currentRound === 1
                                ? 'Finding what you actually do, before deciding what to call it.'
                                : currentRound === 2
                                    ? 'Testing what is sustainable for you.'
                                    : 'Discovering what could actually become valuable.' })] }), _jsx(RoundProgress, { completed: completedInRound, total: questionsInRound.length, questIds: questionsInRound.map((q) => q.id), responses: responses }), _jsx("div", { className: "mb-12", children: _jsx(QuestionCard, { question: currentQuestion, answer: responses[currentQuestion.id] || '', onAnswerChange: handleAnswer }) }), _jsx(SaveIndicator, { status: saveStatus }), _jsxs("div", { className: "flex gap-3 justify-between items-center", children: [_jsx("button", { onClick: handlePrevious, disabled: currentQuestionIndex === 0, className: "btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Previous question", children: "\u2190 Previous" }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-xs text-ink-soft font-mono", children: [completedInRound, " of ", questionsInRound.length, " in round"] }) }), !isLastQuestion ? (_jsx("button", { onClick: handleNext, disabled: !canAdvance, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Next question", children: "Next \u2192" })) : (_jsx("button", { onClick: handleComplete, disabled: !canAdvance || isSaving, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Complete quest", children: isSaving ? 'Generating results...' : 'View Results ✓' }))] }), _jsx("div", { className: "mt-8 p-3 bg-paper-light rounded text-xs text-ink-soft text-center", children: _jsx("p", { children: "\uD83D\uDCA1 Keyboard: \u2190 \u2192 arrows to navigate \u2022 Write what is true, not what sounds impressive" }) })] }) }));
}
