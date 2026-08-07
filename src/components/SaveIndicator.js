import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export default function SaveIndicator({ status }) {
    if (status === 'idle') {
        return null;
    }
    return (_jsxs("div", { className: "flex items-center justify-center gap-2 mb-8 text-sm", children: [status === 'saving' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-2 h-2 bg-amber rounded-full animate-pulse" }), _jsx("span", { className: "text-ink-soft", children: "Saving your progress..." })] })), status === 'saved' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-2 h-2 bg-teal rounded-full" }), _jsx("span", { className: "text-teal", children: "\u2713 Progress saved" })] }))] }));
}
