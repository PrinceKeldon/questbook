import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn, loading } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signIn(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Sign in failed');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-paper flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-md w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx(Link, { to: "/", className: "text-2xl font-serif inline-block mb-4", children: "Questbook" }), _jsx("h1", { className: "text-2xl font-serif mb-2", children: "Sign In" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Welcome back. Let's continue your quest." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm", children: error })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full btn btn-primary", children: loading ? 'Signing In...' : 'Sign In' })] }), _jsx("div", { className: "text-center mt-6", children: _jsxs("p", { className: "text-sm text-ink-soft", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/signup", className: "text-teal hover:text-amber", children: "Create one" })] }) })] }) }));
}
