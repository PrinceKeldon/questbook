import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generatePersonalizedPDF } from '@/lib/generatePDF';
export default function ResultsPage() {
    const { questId, version } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questionnaire, setQuestionnaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    useEffect(() => {
        loadResults();
    }, [user?.id, questId, version]);
    const loadResults = async () => {
        if (!user?.id || !questId || !version)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('questionnaires')
                .select('*')
                .eq('user_id', user.id)
                .eq('quest_id', questId)
                .eq('version', parseInt(version))
                .single();
            if (error)
                throw error;
            setQuestionnaire(data);
        }
        catch (error) {
            console.error('Error loading results:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDownloadPDF = async () => {
        if (!questionnaire || !user)
            return;
        setIsGeneratingPDF(true);
        setPdfError(null);
        try {
            await generatePersonalizedPDF({
                questionnaire,
                userName: user.email?.split('@')[0] || 'User',
            });
        }
        catch (error) {
            setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF');
        }
        finally {
            setIsGeneratingPDF(false);
        }
    };
    const handleCreateVersion = async () => {
        if (user?.id && questId) {
            navigate(`/quest/${questId}`);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("p", { className: "text-ink-soft", children: "Loading your results..." }) }));
    }
    if (!questionnaire) {
        return (_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-serif mb-4", children: "Results not found" }), _jsx("p", { className: "text-ink-soft mb-6", children: "We couldn't find the results for this version." }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "btn btn-primary", children: "Back to Dashboard" })] }));
    }
    const canvas = questionnaire.skills_canvas;
    return (_jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("p", { className: "eyebrow mb-4", children: "Your Results" }), _jsx("h1", { className: "text-4xl font-serif mb-4", children: "You've Found Your Architecture" }), _jsxs("p", { className: "text-lg text-ink-soft mb-8", children: ["Version ", questionnaire.version, " \u2014", ' ', new Date(questionnaire.created_at).toLocaleDateString()] }), questionnaire.completed_at && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-4 justify-center", children: [_jsx("button", { onClick: handleDownloadPDF, disabled: isGeneratingPDF, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: isGeneratingPDF ? '⟳ Generating PDF...' : '↓ Download PDF' }), _jsxs("button", { onClick: handleCreateVersion, className: "btn btn-secondary", children: ["Create Version ", questionnaire.version + 1] })] }), pdfError && (_jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700", children: pdfError }))] }))] }), canvas && (_jsxs("div", { className: "mb-12 p-8 bg-white border-2 border-ink rounded", children: [_jsx("h2", { className: "text-2xl font-serif mb-8 text-center", children: "The Skills Canvas" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "p-6 border border-line rounded", children: [_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "eyebrow text-teal mb-2", children: "01 Innate Strength" }), _jsx("h3", { className: "text-lg font-serif", children: canvas.innate_strength.name }), _jsx("p", { className: "text-xs text-ink-soft mt-2", children: canvas.innate_strength.description })] }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "NATURAL" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.innate_strength.natural, "/5"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "PRACTICAL" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.innate_strength.practical, "/5"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "MEASURABLE" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.innate_strength.measurable, "/5"] })] })] })] }), _jsxs("div", { className: "p-6 border border-line rounded", children: [_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "eyebrow text-teal mb-2", children: "02 Marketable Skill" }), _jsx("h3", { className: "text-lg font-serif", children: canvas.marketable_skill.name }), _jsx("p", { className: "text-xs text-ink-soft mt-2", children: canvas.marketable_skill.description })] }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "NATURAL" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.marketable_skill.natural, "/5"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "PRACTICAL" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.marketable_skill.practical, "/5"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "MEASURABLE" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.marketable_skill.measurable, "/5"] })] })] })] }), _jsxs("div", { className: "p-6 border border-line rounded", children: [_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "eyebrow text-teal mb-2", children: "03 Unique Positioning" }), _jsx("h3", { className: "text-lg font-serif", children: canvas.unique_positioning.name }), _jsx("p", { className: "text-xs text-ink-soft mt-2", children: canvas.unique_positioning.description })] }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "NATURAL" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.unique_positioning.natural, "/5"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "PRACTICAL" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.unique_positioning.practical, "/5"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-ink-soft", children: "MEASURABLE" }), _jsxs("p", { className: "text-xl font-serif text-amber", children: [canvas.unique_positioning.measurable, "/5"] })] })] })] })] }), _jsxs("div", { className: "p-6 border-2 border-dashed border-amber rounded bg-paper-light", children: [_jsx("p", { className: "text-sm text-ink-soft mb-2", children: "Your Positioning" }), _jsxs("p", { className: "text-xl font-serif text-teal", children: ["I help ", _jsx("span", { className: "border-b border-ink", children: "___________" }), " do", ' ', _jsx("span", { className: "border-b border-ink", children: "___________" }), " so that", ' ', _jsx("span", { className: "border-b border-ink", children: "___________" }), "."] })] })] })), _jsxs("div", { className: "mb-12 p-8 bg-white border border-line rounded", children: [_jsx("h2", { className: "text-2xl font-serif mb-4", children: "The 7-Day Proof Plan" }), _jsx("p", { className: "text-sm text-ink-soft mb-6", children: "A Canvas is a hypothesis until someone else confirms it. This plan helps you test it in the real world." }), _jsxs("ol", { className: "space-y-6", children: [_jsxs("li", { className: "flex gap-4", children: [_jsx("span", { className: "font-serif text-2xl text-amber min-w-12", children: "01" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-1", children: "List Five People" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Find five relevant people who match your positioning statement \u2014 people who've had the problem you solve, or know someone who does." })] })] }), _jsxs("li", { className: "flex gap-4", children: [_jsx("span", { className: "font-serif text-2xl text-amber min-w-12", children: "02" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-1", children: "Send One Message Each" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Offer a small paid experiment or session \u2014 not a favour, a paid pilot. Keep the price low enough to be an easy yes." })] })] }), _jsxs("li", { className: "flex gap-4", children: [_jsx("span", { className: "font-serif text-2xl text-amber min-w-12", children: "03" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-1", children: "Deliver It Live" }), _jsx("p", { className: "text-sm text-ink-soft", children: "No automation, no templates. You, live, with one person. Take notes on the exact questions you ask and where energy shifts." })] })] }), _jsxs("li", { className: "flex gap-4", children: [_jsx("span", { className: "font-serif text-2xl text-amber min-w-12", children: "04" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-1", children: "Ask for One Sentence" }), _jsx("p", { className: "text-sm text-ink-soft", children: "After the session, ask: \"What changed for you?\" Collect their words exactly. This becomes your proof line." })] })] }), _jsxs("li", { className: "flex gap-4", children: [_jsx("span", { className: "font-serif text-2xl text-amber min-w-12", children: "05" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-1", children: "Repeat" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Do this with at least three people before changing anything. Three data points beat one strong opinion." })] })] })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-8 mb-12", children: [_jsxs("div", { className: "p-6 bg-paper-light rounded", children: [_jsx("h3", { className: "font-serif text-lg mb-3", children: "This Workbook Won't End" }), _jsxs("p", { className: "text-sm text-ink-soft mb-4", children: ["This is Version ", questionnaire.version, ". Your Architecture evolves as you do."] }), _jsxs("p", { className: "text-sm text-ink-soft", children: ["Come back in a month, a quarter, or a year to create Version", ' ', questionnaire.version + 1, " and see what's changed."] })] }), _jsxs("div", { className: "p-6 bg-paper-light rounded", children: [_jsx("h3", { className: "font-serif text-lg mb-3", children: "What's Next?" }), _jsx("p", { className: "text-sm text-ink-soft mb-4", children: "Once you've tested your positioning with real people, you're ready for Module 2: The Offer." }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "text-sm text-teal hover:text-amber", children: "Explore Future Modules \u2192" })] })] }), _jsxs("div", { className: "flex gap-4 justify-center pb-12", children: [_jsx("button", { onClick: handleDownloadPDF, disabled: isGeneratingPDF, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: isGeneratingPDF ? '⟳ Generating PDF...' : '↓ Download PDF' }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "btn btn-secondary", children: "Back to Dashboard" })] })] }));
}
