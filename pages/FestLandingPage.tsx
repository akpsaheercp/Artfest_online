
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Sparkles, ArrowRight, Trophy, Palette, 
    Monitor, Users, Lock, User, 
    Sun, Moon, Laptop, Eye, EyeOff, LogOut, AlertCircle,
    Layers, Calendar, TreePine, Leaf, CheckCircle2, Star, BookOpen, MapPin, LayoutDashboard, Home, Activity,
    MessageCircle, Send, ExternalLink
} from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';
import { Settings } from '../types';
import { TABS } from '../constants';

// Added missing LandingPageProps interface
interface LandingPageProps {
    theme: 'light' | 'dark' | 'system';
    toggleTheme: (theme: 'light' | 'dark' | 'system') => void;
    settings: Settings;
}

const LandingStatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, colorClass: string }> = ({ icon: Icon, title, value, colorClass }) => (
    <div className="relative group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[60px] pointer-events-none opacity-10 dark:opacity-20 transition-colors duration-500 ${colorClass}`}></div>
        <div className="relative z-10">
            <div className={`w-12 h-12 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110`}>
                <Icon size={24} />
            </div>
            <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter tabular-nums">{value}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-emerald-500/60">Total {title}</p>
        </div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ theme, toggleTheme, settings }) => {
    const { login, logout, firebaseUser, currentUser, state } = useFirebase();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isUnassigned = firebaseUser && !currentUser;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password, true);
        } catch (err: any) {
            setError('Authorization failed. Check handle and access key.');
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (tab: string) => {
        window.location.hash = encodeURIComponent(tab);
    };

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun size={18} />;
        if (theme === 'dark') return <Moon size={18} />;
        return <Laptop size={18} />;
    };

    const cycleTheme = () => {
        if (theme === 'light') toggleTheme('dark');
        else if (theme === 'dark') toggleTheme('system');
        else toggleTheme('light');
    };

    const logoUrl = useMemo(() => {
        if (!settings.branding) return null;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const { typographyUrl, typographyUrlLight, typographyUrlDark } = settings.branding;
        if (isDark) return typographyUrlDark || typographyUrl;
        return typographyUrlLight || typographyUrl;
    }, [settings.branding, theme]);

    const landingStats = useMemo(() => {
        if (!state || !state.items || !state.participants || !state.schedule || !state.results) {
            return { participants: 0, declared: 0, items: 0, scheduled: 0 };
        }
        const activeItemIds = new Set(state.items.map(i => i.id));
        return {
            participants: state.participants.length || 0,
            items: state.items.length || 0,
            scheduled: state.schedule.length || 0,
            declared: state.results.filter(r => r.status === 'Declared' && activeItemIds.has(r.itemId)).length || 0
        };
    }, [state]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white overflow-x-hidden transition-colors duration-1000">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]"></div>
            </div>

            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 shadow-sm' : 'bg-transparent py-8'}`}>
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={settings.branding?.shortName || 'FEST'} className="h-9 w-auto object-contain transition-all group-hover:scale-105" />
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-emerald-500 flex items-center justify-center text-white dark:text-slate-950 font-black shadow-lg transition-transform group-hover:rotate-6">{settings.branding?.shortName?.[0] || 'A'}</div>
                                <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">
                                    {settings.branding?.shortName || 'FEST'}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={cycleTheme}
                            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
                        >
                            {getThemeIcon()}
                        </button>
                        {currentUser ? (
                             <button onClick={() => navigateTo(TABS.DASHBOARD)} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition-all shadow-lg flex items-center gap-2">
                                <LayoutDashboard size={14} /> Admin Console
                             </button>
                        ) : (
                            <a href="#portal" className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition-all shadow-lg">
                                Operator Login
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-48 pb-24 px-6 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                <Star size={14} className="fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{settings.branding?.version || `${new Date().getFullYear()} OFFICIAL EDITION`}</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
                                {settings.heading || 'FESTIVAL'}<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">OPERATIONS.</span>
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                {settings.description || 'The definitive management terminal for orchestrating talent and intelligence. High-fidelity results, live broadcasting, and creative studio integration.'}
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                <button 
                                    onClick={() => navigateTo(TABS.DASHBOARD)} 
                                    className="px-8 py-4 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-emerald-500/10"
                                >
                                    <Activity size={18} /> Live Dashboard
                                </button>
                                <button 
                                    onClick={() => navigateTo(TABS.CREATIVE_STUDIO)} 
                                    className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    <Palette size={18} /> Creative Studio
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
                            <div className="relative z-10 bg-white dark:bg-slate-900 p-4 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 rotate-2 hover:rotate-0 transition-transform duration-700">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Hero" className="w-full h-auto rounded-[2rem] object-contain max-h-[500px]" />
                                ) : (
                                    <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center">
                                        <Trophy size={80} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                )}
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LandingStatCard icon={Users} title="Delegates" value={landingStats.participants} colorClass="bg-emerald-500" />
                    <LandingStatCard icon={Trophy} title="Declared" value={landingStats.declared} colorClass="bg-indigo-500" />
                    <LandingStatCard icon={BookOpen} title="Events" value={landingStats.items} colorClass="bg-amber-500" />
                    <LandingStatCard icon={Calendar} title="Scheduled" value={landingStats.scheduled} colorClass="bg-rose-500" />
                </div>
            </section>

            {/* Access Section */}
            <section id="portal" className="relative z-10 py-32 bg-slate-100 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full"></div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Terminal Access</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Authentication Required</p>
                    </div>

                    {isUnassigned ? (
                        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                             <AlertCircle size={48} className="mx-auto mb-6 text-amber-500" />
                             <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Access Pending</h3>
                             <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                                Registry entry for <strong className="text-slate-900 dark:text-white">{firebaseUser?.email}</strong> is currently awaiting authorization.
                             </p>
                             <button onClick={logout} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                                <LogOut size={16} className="inline mr-2" /> Terminate Session
                             </button>
                        </div>
                    ) : currentUser ? (
                        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                             <CheckCircle2 size={48} className="mx-auto mb-6 text-emerald-500" />
                             <h3 className="text-xl font-black mb-2 uppercase tracking-tight">System Ready</h3>
                             <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                                Active session authenticated for <strong className="text-slate-900 dark:text-white">{currentUser.username}</strong>.
                             </p>
                             <div className="flex flex-col gap-3">
                                <button onClick={() => navigateTo(TABS.DASHBOARD)} className="w-full py-4 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-all">
                                    Open Dashboard
                                </button>
                                <button onClick={logout} className="w-full py-4 text-slate-400 hover:text-rose-500 font-black uppercase text-[9px] tracking-widest transition-all">
                                    Log Out & Exit
                                </button>
                             </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Handle" 
                                        required 
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none transition-all font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Access Key" 
                                        required 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none transition-all font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="py-2 text-rose-500 text-[9px] font-black uppercase tracking-widest">{error}</div>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Validating...' : 'Authorize & Enter'}
                            </button>
                            
                            <p className="pt-4 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
                                V6.5.0 ENTERPRISE CORE
                            </p>
                        </form>
                    )}
                </div>
            </section>

            <footer className="relative z-10 py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
                        <div className="space-y-6 max-w-sm">
                            <p className="text-2xl font-black uppercase tracking-tighter">{settings.heading || 'FESTIVAL'}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Professional event management infrastructure for large-scale talent orchestration and real-time intelligence broadcasting.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full lg:w-auto">
                            {/* WhatsApp Community */}
                            <a href="https://chat.whatsapp.com/FQfs84Ji7vbGLaIdrr35Uc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <ExternalLink size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Community</p>
                                    <p className="text-xs text-slate-500">WhatsApp Group</p>
                                </div>
                            </a>

                            {/* WhatsApp Contact */}
                            <a href="https://wa.me/917902520097" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Support</p>
                                    <p className="text-xs text-slate-500">+91 790 252 0097</p>
                                </div>
                            </a>

                            {/* Telegram Contact */}
                            <a href="https://t.me/+917902520097" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <Send size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Telegram</p>
                                    <p className="text-xs text-slate-500">Official Channel</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em]">© {new Date().getFullYear()} CORE TERMINAL OPS • ALL RIGHTS RESERVED</p>
                        <div className="flex gap-4">
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
