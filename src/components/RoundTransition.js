import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const roundInfo = {
    1: {
        title: 'The Pattern Finder',
        description: 'Finding what you actually do, before deciding what to call it.',
        completed: "You've explored what people ask you for, what energizes you, and what you notice.",
    },
    2: {
        title: 'The Friction Test',
        description: 'Testing what is sustainable for you.',
        completed: "You've identified what drains you, what energizes you, and who naturally seeks you out.",
    },
    3: {
        title: 'The Market Reality Test',
        description: 'Discovering what could actually become valuable.',
        completed: "You've examined what measurable outcomes you create and what makes you difficult to replace.",
    },
};
export default function RoundTransition({ round, onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const info = roundInfo[round] || roundInfo[2];
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);
    return (_jsx("div", { className: "min-h-screen bg-paper flex items-center justify-center px-4", children: _jsxs("div", { className: `max-w-2xl text-center transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`, children: [_jsx("div", { className: "mb-8", children: _jsx("div", { className: "w-16 h-16 mx-auto bg-teal rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-3xl text-white", children: "\u2713" }) }) }), _jsxs("p", { className: "eyebrow mb-4", children: ["Round ", round - 1, " Complete"] }), _jsx("h2", { className: "text-3xl font-serif mb-4 text-ink", children: "Well done." }), _jsx("p", { className: "text-sm text-ink-soft mb-8 max-w-md mx-auto", children: roundInfo[round - 1]?.completed ||
                        'Round completed.' }), _jsxs("div", { className: "p-6 bg-white border border-line rounded mb-8", children: [_jsxs("p", { className: "eyebrow mb-3", children: ["Next: Round ", round] }), _jsx("h3", { className: "text-xl font-serif mb-2", children: info.title }), _jsx("p", { className: "text-sm text-ink-soft", children: info.description })] }), _jsx("p", { className: "text-xs text-ink-soft", children: "Continuing in 3 seconds... Press any key to skip." })] }) }));
}
