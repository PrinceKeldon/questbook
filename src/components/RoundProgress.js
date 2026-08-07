import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function RoundProgress({ completed, total, questIds, responses, }) {
    return (_jsxs("div", { className: "mb-12", children: [_jsx("div", { className: "flex items-center gap-3 mb-4", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-2", children: [_jsx("p", { className: "text-sm font-medium text-ink", children: "Round Progress" }), _jsxs("p", { className: "text-xs text-ink-soft font-mono", children: [completed, " of ", total, " complete"] })] }), _jsx("div", { className: "w-full bg-line-soft rounded-full h-2", children: _jsx("div", { className: "bg-amber h-2 rounded-full transition-all duration-300", style: { width: `${(completed / total) * 100}%` } }) })] }) }), _jsx("div", { className: "flex gap-2 justify-center flex-wrap", children: questIds.map((id, idx) => {
                    const isAnswered = responses[id]?.trim().length > 0;
                    return (_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isAnswered
                            ? 'bg-teal text-white'
                            : 'bg-line-soft text-ink-soft'}`, title: `Question ${idx + 1}`, children: isAnswered ? '✓' : idx + 1 }, id));
                }) })] }));
}
