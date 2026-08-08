import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { submitImmediateFeedback, schedule3moFollowup, schedule6moFollowup } from '@/lib/mlDataCollection';
export default function ImmediateFeedbackForm({ user_id, questionnaire_id, detected_skills, onSubmit, }) {
    const [step, setStep] = useState('accuracy');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
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
    });
    const handleNext = () => {
        if (step === 'accuracy' && formData.accuracy_score === 0) {
            setError('Please rate accuracy');
            return;
        }
        if (step === 'usefulness' && formData.usefulness_score === 0) {
            setError('Please rate usefulness');
            return;
        }
        setError(null);
        if (step === 'accuracy')
            setStep('usefulness');
        else if (step === 'usefulness')
            setStep('action');
        else if (step === 'action')
            setStep('corrections');
        else if (step === 'corrections')
            handleSubmit();
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await submitImmediateFeedback(user_id, questionnaire_id, formData);
            // Schedule follow-ups
            await schedule3moFollowup(user_id, questionnaire_id);
            await schedule6moFollowup(user_id, questionnaire_id);
            setStep('done');
            setTimeout(() => onSubmit(), 2000);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
            setIsSubmitting(false);
        }
    };
    if (step === 'done') {
        return (_jsxs("div", { className: "max-w-2xl mx-auto text-center py-12", children: [_jsx("div", { className: "mb-6", children: _jsx("div", { className: "w-16 h-16 mx-auto bg-teal rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-3xl text-white", children: "\u2713" }) }) }), _jsx("h2", { className: "text-2xl font-serif mb-3", children: "Thank you!" }), _jsx("p", { className: "text-ink-soft mb-6", children: "Your feedback helps us improve. We'll check in with you in 3 and 6 months to see how these skills have evolved." }), _jsx("p", { className: "text-sm text-ink-soft", children: "Redirecting..." })] }));
    }
    return (_jsxs("div", { className: "max-w-2xl mx-auto py-8", children: [_jsx("div", { className: "flex gap-2 mb-8", children: ['accuracy', 'usefulness', 'action', 'corrections'].map((s, i) => (_jsx("div", { className: `flex-1 h-1 rounded ${step === s ? 'bg-teal' : ['accuracy', 'usefulness', 'action', 'corrections'].indexOf(step) > i ? 'bg-teal' : 'bg-line-soft'}` }, s))) }), step === 'accuracy' && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-serif mb-6", children: "How accurate were these skills?" }), _jsx("p", { className: "text-ink-soft mb-8", children: "Looking at your detected skills, how well do they reflect who you actually are?" }), _jsx("div", { className: "space-y-4 mb-8", children: [1, 2, 3, 4, 5].map((score) => (_jsxs("button", { onClick: () => setFormData({ ...formData, accuracy_score: score }), className: `w-full p-4 text-left border rounded transition ${formData.accuracy_score === score
                                ? 'border-teal bg-teal/5'
                                : 'border-line hover:border-teal'}`, children: [_jsxs("div", { className: "font-medium", children: ['⭐'.repeat(score), " ", score, "/5"] }), _jsx("div", { className: "text-sm text-ink-soft", children: [
                                        'Not at all',
                                        'Somewhat inaccurate',
                                        'Somewhat accurate',
                                        'Very accurate',
                                        'Perfect fit',
                                    ][score - 1] })] }, score))) }), _jsx("textarea", { placeholder: "Optional: Any comments about accuracy?", value: formData.accuracy_comment, onChange: (e) => setFormData({ ...formData, accuracy_comment: e.target.value }), className: "w-full p-4 border border-line rounded mb-6 resize-none h-24" }), error && _jsx("div", { className: "text-red-600 text-sm mb-4", children: error }), _jsx("button", { onClick: handleNext, className: "btn btn-primary w-full", children: "Next \u2192" })] })), step === 'usefulness' && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-serif mb-6", children: "Did this help clarify your direction?" }), _jsx("p", { className: "text-ink-soft mb-8", children: "Beyond accuracy, did this exercise help you understand yourself better?" }), _jsx("div", { className: "space-y-4 mb-8", children: [1, 2, 3, 4, 5].map((score) => (_jsxs("button", { onClick: () => setFormData({ ...formData, usefulness_score: score }), className: `w-full p-4 text-left border rounded transition ${formData.usefulness_score === score
                                ? 'border-amber bg-amber/5'
                                : 'border-line hover:border-amber'}`, children: [_jsxs("div", { className: "font-medium", children: ['💡'.repeat(score), " ", score, "/5"] }), _jsx("div", { className: "text-sm text-ink-soft", children: ['Not useful', 'Slightly useful', 'Useful', 'Very useful', 'Extremely useful'][score - 1] })] }, score))) }), _jsx("textarea", { placeholder: "Optional: How could this be more useful?", value: formData.usefulness_comment, onChange: (e) => setFormData({ ...formData, usefulness_comment: e.target.value }), className: "w-full p-4 border border-line rounded mb-6 resize-none h-24" }), error && _jsx("div", { className: "text-red-600 text-sm mb-4", children: error }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setStep('accuracy'), className: "btn btn-secondary flex-1", children: "\u2190 Back" }), _jsx("button", { onClick: handleNext, className: "btn btn-primary flex-1", children: "Next \u2192" })] })] })), step === 'action' && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-serif mb-6", children: "What will you do with this?" }), _jsx("p", { className: "text-ink-soft mb-8", children: "How do you plan to use these insights?" }), _jsx("div", { className: "space-y-3 mb-8", children: [
                            { value: 'share_with_mentor', label: '💬 Share with a mentor or coach' },
                            { value: 'update_linkedin', label: '🔗 Update LinkedIn/resume' },
                            { value: 'career_conversation', label: '🤝 Use in a career conversation' },
                            { value: 'personal_reflection', label: '📝 Keep for personal reflection' },
                            { value: 'none', label: '✋ Not sure yet' },
                        ].map((option) => (_jsxs("label", { className: "flex items-center gap-3 p-4 border border-line rounded cursor-pointer hover:border-teal", children: [_jsx("input", { type: "radio", name: "action_intent", value: option.value, checked: formData.action_intent === option.value, onChange: (e) => setFormData({ ...formData, action_intent: e.target.value }), className: "w-4 h-4" }), _jsx("span", { children: option.label })] }, option.value))) }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setStep('usefulness'), className: "btn btn-secondary flex-1", children: "\u2190 Back" }), _jsx("button", { onClick: handleNext, className: "btn btn-primary flex-1", children: "Next \u2192" })] })] })), step === 'corrections' && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-serif mb-6", children: "Any corrections?" }), _jsx("p", { className: "text-ink-soft mb-8", children: "If any of the detected skills aren't quite right, let us know what they should be. (Optional)" }), _jsxs("div", { className: "space-y-6 mb-8", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: ["Should skill #1 be \"", detected_skills.skill_1, "\" or something else?"] }), _jsx("input", { type: "text", placeholder: `e.g., "Design" instead of "${detected_skills.skill_1}"`, value: formData.corrected_skill_1, onChange: (e) => setFormData({ ...formData, corrected_skill_1: e.target.value }), className: "w-full p-3 border border-line rounded" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: ["Should skill #2 be \"", detected_skills.skill_2, "\" or something else?"] }), _jsx("input", { type: "text", placeholder: `e.g., "Writing" instead of "${detected_skills.skill_2}"`, value: formData.corrected_skill_2, onChange: (e) => setFormData({ ...formData, corrected_skill_2: e.target.value }), className: "w-full p-3 border border-line rounded" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: ["Should skill #3 be \"", detected_skills.skill_3, "\" or something else?"] }), _jsx("input", { type: "text", placeholder: `e.g., "Negotiation" instead of "${detected_skills.skill_3}"`, value: formData.corrected_skill_3, onChange: (e) => setFormData({ ...formData, corrected_skill_3: e.target.value }), className: "w-full p-3 border border-line rounded" })] })] }), _jsx("textarea", { placeholder: "Anything else? (Optional)", value: formData.general_feedback, onChange: (e) => setFormData({ ...formData, general_feedback: e.target.value }), className: "w-full p-3 border border-line rounded mb-8 resize-none h-24" }), error && _jsx("div", { className: "text-red-600 text-sm mb-4", children: error }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setStep('action'), className: "btn btn-secondary flex-1", children: "\u2190 Back" }), _jsx("button", { onClick: handleNext, disabled: isSubmitting, className: "btn btn-primary flex-1 disabled:opacity-50", children: isSubmitting ? 'Submitting...' : 'Submit' })] })] }))] }));
}
