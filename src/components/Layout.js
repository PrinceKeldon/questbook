import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export default function Layout({ children }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };
    return (_jsxs("div", { className: "min-h-screen bg-paper", children: [_jsx("header", { className: "bg-white border-b border-line", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Link, { to: "/dashboard", className: "flex items-center gap-2", children: _jsx("h1", { className: "text-xl font-serif", children: "Questbook" }) }), user && (_jsxs("nav", { className: "flex items-center gap-6", children: [_jsx(Link, { to: "/dashboard", className: "text-sm text-ink hover:text-teal", children: "Dashboard" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-sm text-ink-soft", children: user.email }), _jsx("button", { onClick: handleSignOut, className: "text-sm text-teal hover:text-amber", children: "Sign Out" })] })] }))] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: children }), _jsx("footer", { className: "bg-navy text-paper text-center py-8 mt-12", children: _jsx("p", { className: "text-sm", children: "\u00A9 2024 Questbook. All rights reserved." }) })] }));
}
