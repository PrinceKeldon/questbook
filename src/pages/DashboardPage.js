import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
export default function DashboardPage() {
    const { user } = useAuth();
    const [quests, setQuests] = useState([]);
    const [userResponses, setUserResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadQuests();
    }, [user?.id]);
    const loadQuests = async () => {
        if (!user?.id)
            return;
        setLoading(true);
        try {
            // Load all available quests
            const { data: questsData } = await supabase
                .from('quests')
                .select('*')
                .order('module_order', { ascending: true });
            // Load user's responses
            const { data: responsesData } = await supabase
                .from('questionnaires')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setQuests(questsData || []);
            setUserResponses(responsesData || []);
        }
        catch (error) {
            console.error('Error loading quests:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getUserQuestProgress = (questId) => {
        const responses = userResponses.filter((r) => r.quest_id === questId);
        if (responses.length === 0)
            return null;
        return responses[0];
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("p", { className: "text-ink-soft", children: "Loading your quests..." }) }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-12", children: [_jsx("p", { className: "eyebrow mb-2", children: "Welcome Back" }), _jsx("h1", { className: "text-4xl font-serif mb-4", children: user?.email?.split('@')[0] }), _jsx("p", { className: "text-lg text-ink-soft", children: "Continue your journey of self-discovery." })] }), _jsx("div", { className: "grid md:grid-cols-2 gap-8", children: quests.map((quest) => {
                    const progress = getUserQuestProgress(quest.id);
                    return (_jsxs("div", { className: "p-8 bg-white border border-line rounded", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("p", { className: "eyebrow mb-2", children: ["Field Manual No. ", quest.module_order] }), _jsx("h2", { className: "text-2xl font-serif mb-2", children: quest.title }), _jsx("p", { className: "text-sm text-ink-soft", children: quest.description })] }), progress && (_jsxs("div", { className: "my-4 p-3 bg-paper-light rounded text-sm", children: [_jsx("p", { className: "text-ink-soft mb-1", children: progress.completed_at
                                            ? '✓ Completed'
                                            : '◐ In Progress' }), progress.skills_canvas && (_jsxs("p", { className: "text-teal font-medium", children: ["Version ", progress.version, " available"] }))] })), _jsx("div", { className: "flex flex-col gap-2", children: progress ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: `/quest/${quest.id}/results/${progress.version}`, className: "btn btn-secondary text-center", children: "View Results" }), _jsx(Link, { to: `/quest/${quest.id}`, className: "btn btn-secondary text-center", children: "Continue/Edit" })] })) : (_jsx(Link, { to: `/quest/${quest.id}`, className: "btn btn-primary text-center", children: "Begin Quest \u2192" })) }), progress && userResponses.filter((r) => r.quest_id === quest.id).length > 1 && (_jsxs("div", { className: "mt-4 pt-4 border-t border-line-soft", children: [_jsx("p", { className: "text-xs eyebrow mb-2", children: "Previous Versions" }), _jsx("div", { className: "space-y-1", children: userResponses
                                            .filter((r) => r.quest_id === quest.id)
                                            .slice(1)
                                            .map((version) => (_jsxs(Link, { to: `/quest/${quest.id}/results/${version.version}`, className: "block text-xs text-teal hover:text-amber", children: ["Version ", version.version, " \u2014", ' ', new Date(version.created_at).toLocaleDateString()] }, version.id))) })] }))] }, quest.id));
                }) }), _jsxs("div", { className: "mt-12 p-8 bg-paper-light rounded", children: [_jsx("h2", { className: "text-2xl font-serif mb-4", children: "How It Works" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow mb-2", children: "01 Complete Quest" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Answer 20 carefully designed questions across 3 rounds." })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow mb-2", children: "02 Discover Patterns" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Real-time pattern detection reveals what the system finds in your answers." })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow mb-2", children: "03 Get Results" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Download your personalized Architecture as a beautiful PDF." })] })] })] })] }));
}
