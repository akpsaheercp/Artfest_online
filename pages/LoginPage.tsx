
import React, { useState, useMemo } from 'react';
import { User, Lock, Sun, Moon, Laptop, ArrowRight, LogOut, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';
import { Settings } from '../types';

interface LoginPageProps {
    theme: string;
    toggleTheme: (theme: 'light' | 'dark' | 'system') => void;
    settings: Settings;
}

const LoginPage: React.FC<LoginPageProps> = ({ theme, toggleTheme, settings }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout, firebaseUser, currentUser } = useFirebase();

    // Check if user is authenticated via Firebase but NOT in our local user list
    const isUnassigned = firebaseUser && !currentUser;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password, rememberMe);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setError('');
        setUsername('');
        setPassword('');
    };

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun className="h-5 w-5" />;
        if (theme === 'dark') return <Moon className="h-5 w-5" />;
        return <Laptop className="h-5 w-5" />;
    };

    const nextThemeMap: Record<string, 'light' | 'dark' | 'system'> = {
        'light': 'dark',
        'dark': 'system',
        'system': 'light'
    };

    const handleThemeToggle = () => {
        toggleTheme(nextThemeMap[theme] || 'system');
    };

    const logoUrl = useMemo(() => {
        if (!settings.branding) return null;
        const isDark = document.documentElement.classList.contains('dark');
        const { typographyUrl, typographyUrlLight, typographyUrlDark } = settings.branding;
        if (isDark) return typographyUrlDark || typographyUrl;
        return typographyUrlLight || typographyUrl;
    }, [settings.branding, theme]);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden transition-colors duration-1000 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }}></div>

            {/* Theme Toggle */}
            <button
                onClick={handleThemeToggle}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all hover:scale-105 z-20 shadow-sm"
            >
                {getThemeIcon()}
            </button>

            {/* Main Card */}
            <div className="relative w-full max-w-md p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-700 z-10">
                
                {/* Header / Logo */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6">
                        <Lock className="text-white dark:text-slate-950" size={32} />
                    </div>
                    {logoUrl ? (
                        <img 
                            src={logoUrl} 
                            alt={settings.heading} 
                            className="w-full max-w-[280px] h-auto max-h-40 mx-auto object-contain filter drop-shadow-xl" 
                        />
                    ) : (
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                            System<br/><span className="text-emerald-500">Access.</span>
                        </h1>
                    )}
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400/60">Secure Operator Terminal</p>
                </div>

                {isUnassigned ? (
                    <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 text-center animate-in fade-in zoom-in">
                        <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
                        <h3 className="font-black uppercase tracking-tight text-lg mb-2">Access Restricted</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-8">
                            Identify for <strong className="text-slate-900 dark:text-white font-mono">{firebaseUser?.email}</strong> is not yet authorized in this terminal registry.
                        </p>
                        <button 
                            onClick={handleLogout}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all"
                        >
                            <LogOut size={16} className="inline mr-2" /> Disconnect
                        </button>
                    </div>
                ) : (
                    /* Login Form */
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            {/* Username Input */}
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none transition-all font-bold text-sm focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Operator Handle"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none transition-all font-bold text-sm focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Access Key"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Remember Me */}
                        <div className="flex items-center justify-between py-2">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20"
                                />
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-500 transition-colors">
                                    Persistent Session
                                </span>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="py-2 text-rose-500 text-[9px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-[0.4em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Authorizing...' : 'Enter System'}
                        </button>
                    </form>
                )}

                {/* Footer Watermark */}
                <div className="mt-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">
                        V6.5.0 ENTERPRISE CORE • SECURE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
