import React, { useState, useEffect } from 'react';
import { 
    Sparkles, ArrowRight, Trophy, Palette, 
    Monitor, Users, Plus, Search, Globe, ShieldCheck, 
    Star, LayoutDashboard, Zap, Cloud, CheckCircle2,
    Lock, Mail, LogOut, ExternalLink, Calendar, ChevronRight
} from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { Festival } from '../types';

const PortalPage: React.FC = () => {
    const { createFestival, firebaseUser, login, signup, logout } = useFirebase();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [myFestivals, setMyFestivals] = useState<Festival[]>([]);
    const [isFetchingFestivals, setIsFetchingFestivals] = useState(false);

    // Auth State
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setError('');
        try {
            if (authMode === 'LOGIN') await login(email, password);
            else await signup(email, password);
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setIsAuthLoading(false);
        }
    };

    // Fetch User Festivals
    useEffect(() => {
        if (firebaseUser) {
            setIsFetchingFestivals(true);
            const db = getFirestore();
            const q = query(collection(db, 'festivals'), where('ownerId', '==', firebaseUser.uid));
            getDocs(q).then(snap => {
                const fests = snap.docs.map(d => ({ id: d.id, ...d.data() } as Festival));
                setMyFestivals(fests);
            }).finally(() => setIsFetchingFestivals(false));
        } else {
            setMyFestivals([]);
        }
    }, [firebaseUser]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !slug) return;
        setIsCreating(true);
        setError('');
        try {
            const finalSlug = await createFestival(name, slug);
            window.location.search = `?f=${finalSlug}`;
        } catch (err: any) {
            setError(err.message || "Failed to create festival.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-1000 flex flex-col items-center justify-center p-6 font-sans">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl w-full space-y-12">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6">
                        <Globe className="text-white dark:text-slate-950" size={32} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                        CENTRAL<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">CONTROL.</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-[0.4em]">
                        Festival Management Infrastructure
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* Left Column: Auth / Create */}
                    <div className="lg:col-span-1 p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-sm flex flex-col animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
                        
                        {!firebaseUser ? (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-tight mb-1">{authMode === 'LOGIN' ? 'Manager Login' : 'Register Core'}</h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentication required for access</p>
                                </div>

                                <form onSubmit={handleAuth} className="space-y-4 flex-grow flex flex-col">
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input 
                                                type="email" 
                                                placeholder="Email Address" 
                                                required 
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input 
                                                type="password" 
                                                placeholder="Security Key" 
                                                required 
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all"
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-rose-500 text-[9px] font-black uppercase mt-2 tracking-widest">{error}</p>}

                                    <div className="space-y-4 mt-auto pt-6">
                                        <button 
                                            type="submit" 
                                            disabled={isAuthLoading}
                                            className="w-full py-4 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            {isAuthLoading ? 'Verifying...' : (authMode === 'LOGIN' ? 'Sign In to Portal' : 'Register Account')}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                                            className="w-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors"
                                        >
                                            {authMode === 'LOGIN' ? "Need an account? Request Access" : "Have access? Secure Sign In"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight mb-1">New Terminal</h2>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest truncate max-w-[150px]">{firebaseUser.email}</p>
                                    </div>
                                    <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Sign Out"><LogOut size={18}/></button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-4 flex-grow flex flex-col">
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Festival Heading" 
                                                required 
                                                value={name}
                                                onChange={e => {
                                                    setName(e.target.value);
                                                    if(!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                                }}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="unique-slug" 
                                                required 
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm transition-all"
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-rose-500 text-[9px] font-black uppercase mt-2 tracking-widest">{error}</p>}

                                    <button 
                                        type="submit" 
                                        disabled={isCreating}
                                        className="w-full py-4 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg mt-auto hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {isCreating ? 'Provisioning...' : 'Initialize Instance'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Middle Column: My Festivals */}
                    <div className="lg:col-span-1 p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <div className="mb-8">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-1">Managed Nodes</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active deployment registry</p>
                        </div>

                        {!firebaseUser ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                <ShieldCheck size={48} className="text-slate-400" />
                                <p className="text-[9px] font-black uppercase tracking-widest max-w-[150px]">Identify to view registry</p>
                            </div>
                        ) : (
                            <div className="flex-grow space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                                {isFetchingFestivals ? (
                                    <div className="py-10 text-center animate-pulse text-[9px] font-black uppercase tracking-widest text-slate-400">Scanning registry...</div>
                                ) : myFestivals.length === 0 ? (
                                    <div className="py-10 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">No active nodes detected.<br/>Initialize a new instance.</div>
                                ) : (
                                    myFestivals.map(fest => (
                                        <button 
                                            key={fest.id}
                                            onClick={() => window.location.href = `/?f=${fest.slug}`}
                                            className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all group text-left flex items-center justify-between"
                                        >
                                            <div className="min-w-0">
                                                <h4 className="font-black uppercase tracking-tight text-xs text-slate-900 dark:text-slate-200 truncate">{fest.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Node /{fest.slug}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                        
                    </div>

                    {/* Right Column: Features */}
                    <div className="lg:col-span-1 p-8 rounded-[2rem] bg-slate-900 text-white flex flex-col animate-in fade-in slide-in-from-right-8 duration-1000 delay-700 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                        
                        <div className="mb-10 relative z-10">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-1">Capabilities</h2>
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Core Protocol Modules</p>
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                            <FeatureItem icon={Zap} title="Instant Deployment" desc="One-click festival infrastructure setup." />
                            <FeatureItem icon={ShieldCheck} title="Judge Terminal" desc="Distributed scoring & real-time verification." />
                            <FeatureItem icon={Monitor} title="Broadcasting" desc="High-fidelity live result visualization." />
                            <FeatureItem icon={Cloud} title="Cloud Sync" desc="Automated multi-node data persistence." />
                        </div>

                        <div className="mt-auto pt-10 flex items-center justify-between text-emerald-500 font-black uppercase tracking-widest text-[8px]">
                            <span>V6.5.0 ENTERPRISE</span>
                            <div className="flex gap-0.5">
                                <Star size={8} fill="currentColor" />
                                <Star size={8} fill="currentColor" />
                                <Star size={8} fill="currentColor" />
                                <Star size={8} fill="currentColor" />
                                <Star size={8} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 animate-in fade-in duration-1000 delay-[1200ms]">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">
                        © {new Date().getFullYear()} CORE TERMINAL OPS • SECURE INTERFACE
                    </p>
                </div>
            </div>
        </div>
    );
};

const FeatureItem: React.FC<{ icon: React.ElementType, title: string, desc: string }> = ({ icon: Icon, title, desc }) => (
    <div className="flex items-start gap-4">
        <div className="p-2.5 bg-white/5 rounded-xl text-emerald-500 border border-white/5">
            <Icon size={18} />
        </div>
        <div>
            <h4 className="font-black uppercase tracking-tight text-xs mb-1">{title}</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default PortalPage;