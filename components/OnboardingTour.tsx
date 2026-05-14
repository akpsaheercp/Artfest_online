
import React, { useState, useEffect } from 'react';
import { 
    X, ChevronRight, ChevronLeft, LayoutDashboard, 
    Settings, UserPlus, Gavel, FileText, Palette, 
    Sparkles, Rocket, Info, CheckCircle2
} from 'lucide-react';

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    image?: string;
}

const steps: OnboardingStep[] = [
    {
        title: "Welcome to the Terminal",
        description: "You've just launched a powerful multi-tenant management system. This tour will show you how to orchestrate your festival like a pro.",
        icon: Rocket,
        color: "bg-emerald-500",
    },
    {
        title: "The Live Dashboard",
        description: "Monitor your festival's heartbeat in real-time. Track total delegates, declared results, and active events from a single screen.",
        icon: LayoutDashboard,
        color: "bg-sky-500",
    },
    {
        title: "Brand Your Festival",
        description: "Go to Settings to change the name, logo, and theme. Every detail in this app is dynamic and instantly rebrandable.",
        icon: Settings,
        color: "bg-zinc-500",
    },
    {
        title: "Register Participants",
        description: "Use the Data Entry module to add teams, categories, and individual participants. Our system handles complex constraints automatically.",
        icon: UserPlus,
        color: "bg-teal-500",
    },
    {
        title: "Live Adjudication",
        description: "Judges get a dedicated terminal to enter marks. Results are calculated instantly using your custom grade point rules.",
        icon: Gavel,
        color: "bg-rose-500",
    },
    {
        title: "Professional Reports",
        description: "Generate beautiful PDF merit reports, ID cards, and valuation sheets with a single click. Ready for the printer.",
        icon: FileText,
        color: "bg-cyan-500",
    },
    {
        title: "Creative Studio",
        description: "Design and download custom E-Posters and Certificates for your events using our built-in graphics engine.",
        icon: Palette,
        color: "bg-pink-500",
    },
    {
        title: "Ready to Launch?",
        description: "You're all set! Explore the demo data or start clearing it out to host your own spectacular event.",
        icon: Sparkles,
        color: "bg-amber-500",
    }
];

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    const next = () => {
        if (isLast) onClose();
        else setCurrentStep(prev => prev + 1);
    };

    const prev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
                
                {/* Header/Progress */}
                <div className="p-8 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-brand-primary dark:bg-brand-accent' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} 
                            />
                        ))}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X size={20} className="text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-10 pb-10 flex-grow flex flex-col items-center text-center">
                    <div className={`w-24 h-24 ${step.color} text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl rotate-3 transform transition-transform hover:rotate-0 duration-500`}>
                        <step.icon size={48} />
                    </div>
                    
                    <h2 className="text-4xl font-black font-serif text-brand-primary dark:text-white uppercase tracking-tighter mb-6 leading-tight">
                        {step.title}
                    </h2>
                    
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
                        {step.description}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-zinc-50 dark:bg-white/[0.02] flex justify-between items-center border-t border-zinc-100 dark:border-white/5">
                    <button 
                        onClick={prev}
                        disabled={currentStep === 0}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0' : 'text-zinc-400 hover:text-brand-primary hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-2"><ChevronLeft size={16}/> Back</div>
                    </button>

                    <button 
                        onClick={next}
                        className={`px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 flex items-center gap-3 ${isLast ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary'}`}
                    >
                        {isLast ? (
                            <>Get Started <CheckCircle2 size={16}/></>
                        ) : (
                            <>Continue <ChevronRight size={16}/></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
