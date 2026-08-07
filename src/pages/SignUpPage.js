import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signUp, loading } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        try {
            await signUp(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Sign up failed');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-paper flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-md w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx(Link, { to: "/", className: "text-2xl font-serif inline-block mb-4", children: "Questbook" }), _jsx("h1", { className: "text-2xl font-serif mb-2", children: "Create Account" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Begin your journey of self-discovery." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm", children: error })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Confirm Password" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, disabled: loading })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full btn btn-primary", children: loading ? 'Creating Account...' : 'Create Account' })] }), _jsx("div", { className: "text-center mt-6", children: _jsxs("p", { className: "text-sm text-ink-soft", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-teal hover:text-amber", children: "Sign in" })] }) }), _jsxs("div", { className: "mt-8 p-4 bg-paper-light rounded text-sm text-ink-soft", children: [_jsx("p", { className: "font-medium mb-2", children: "Get started with:" }), _jsxs("ul", { className: "space-y-1 text-xs", children: [_jsx("li", { children: "\u2713 20 discovery questions" }), _jsx("li", { children: "\u2713 Real-time pattern detection" }), _jsx("li", { children: "\u2713 Personalized Skills Canvas" }), _jsx("li", { children: "\u2713 Downloadable PDF results" })] })] })] }) }));
}
