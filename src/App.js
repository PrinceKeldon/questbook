import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import DashboardPage from '@/pages/DashboardPage';
import QuestPage from '@/pages/QuestPage';
import ResultsPage from '@/pages/ResultsPage';
function App() {
    const { user, initialized } = useAuth();
    if (!initialized) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-paper", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-serif text-ink", children: "Questbook" }), _jsx("p", { className: "text-ink-soft mt-2", children: "Loading..." })] }) }));
    }
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpPage, {}) }), _jsx(Route, { path: "/dashboard", element: user ? (_jsx(Layout, { children: _jsx(DashboardPage, {}) })) : (_jsx(Navigate, { to: "/login" })) }), _jsx(Route, { path: "/quest/:questId", element: user ? (_jsx(Layout, { children: _jsx(QuestPage, {}) })) : (_jsx(Navigate, { to: "/login" })) }), _jsx(Route, { path: "/quest/:questId/results/:version", element: user ? (_jsx(Layout, { children: _jsx(ResultsPage, {}) })) : (_jsx(Navigate, { to: "/login" })) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] }) }));
}
export default App;
