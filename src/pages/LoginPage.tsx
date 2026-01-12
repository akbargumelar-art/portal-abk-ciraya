import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(username, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Demo accounts - credentials match auth.service.ts
    const demoAccounts = [
        { username: 'admin', role: 'Admin Super' },
        { username: 'manager', role: 'Manager' },
        { username: 'spv_ids', role: 'Supervisor IDS' },
        { username: 'sales', role: 'Salesforce' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] via-[#2E5A8F] to-[#1E3A5F] flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#F13B4B]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#F13B4B]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F13B4B] to-[#D92939] rounded-2xl shadow-xl mb-4">
                        <span className="text-white font-bold text-2xl">CR</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Portal Cirebon Raya</h1>
                    <p className="text-gray-300 mt-1">PT Agrabudi Komunika</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="input"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#F13B4B] focus:ring-[#F13B4B]" />
                                <span className="text-sm text-white">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-[#F13B4B] hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary py-3 text-base font-semibold"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center mb-3">Demo accounts (password: password)</p>
                        <div className="grid grid-cols-2 gap-2">
                            {demoAccounts.map(account => (
                                <button
                                    key={account.username}
                                    type="button"
                                    onClick={() => {
                                        setUsername(account.username);
                                        setPassword('password');
                                    }}
                                    className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-white transition-colors text-left"
                                >
                                    <span className="font-medium">{account.username}</span>
                                    <span className="text-gray-400 block">{account.role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    © 2024 PT Agrabudi Komunika. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
