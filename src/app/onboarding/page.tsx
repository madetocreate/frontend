"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  User, 
  Briefcase, 
  Rocket, 
  Zap, 
  MessageSquare, 
  BarChart3,
  LayoutGrid,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Types ---

type OnboardingData = {
  firstName: string;
  lastName: string;
  role: string;
  goals: string[];
};

type UpdateFn = <K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K]
) => void;

// --- Steps ---

const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
    <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
      <Sparkles className="w-12 h-12 text-white" />
    </div>
    <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">Willkommen an Bord!</h1>
    <p className="text-lg text-[#86868B] max-w-md">
      Wir freuen uns, dass du da bist. Lass uns in wenigen Schritten deinen persönlichen Workspace einrichten.
    </p>
    <Button 
      size="lg" 
      onClick={onNext}
      className="mt-8 rounded-full px-8 h-12 text-base bg-[#1D1D1F] hover:bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
    >
      Loslegen <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  </div>
);

const NameStep = ({ data, update, onNext }: { data: OnboardingData; update: UpdateFn; onNext: () => void }) => (
  <div className="space-y-8 w-full max-w-md mx-auto animate-in slide-in-from-right-8 duration-500">
    <div className="space-y-2 text-center">
      <h2 className="text-2xl font-semibold text-[#1D1D1F]">Wie dürfen wir dich nennen?</h2>
      <p className="text-[#86868B]">Damit wir wissen, mit wem wir es zu tun haben.</p>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-[#86868B] ml-1">Vorname</label>
        <div className="relative">
          <Input 
            value={data.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className="h-14 rounded-2xl border-gray-200 bg-white text-lg px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Max"
            autoFocus
          />
          <User className="absolute right-4 top-4 text-gray-300 w-6 h-6" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-[#86868B] ml-1">Nachname</label>
        <Input 
          value={data.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          className="h-14 rounded-2xl border-gray-200 bg-white text-lg px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="Mustermann"
        />
      </div>
    </div>

    <Button 
      size="lg" 
      onClick={onNext}
      disabled={!data.firstName.trim()}
      className="w-full rounded-2xl h-12 text-base"
    >
      Weiter
    </Button>
  </div>
);

const RoleStep = ({ data, update, onNext }: { data: OnboardingData; update: UpdateFn; onNext: () => void }) => {
  const roles = [
    { id: "agent", label: "Makler", icon: Briefcase, desc: "Immobilien vermarkten & verkaufen" },
    { id: "manager", label: "Manager", icon: LayoutGrid, desc: "Teams & Projekte steuern" },
    { id: "support", label: "Support", icon: MessageSquare, desc: "Kundenanfragen bearbeiten" },
    { id: "analyst", label: "Analyst", icon: BarChart3, desc: "Daten & Märkte auswerten" },
  ];

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-[#1D1D1F]">Was beschreibt deine Rolle am besten?</h2>
        <p className="text-[#86868B]">Wir passen die Oberfläche an deine Bedürfnisse an.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;
          return (
            <button
              key={role.id}
              onClick={() => update("role", role.id)}
              className={cn(
                "relative group flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-200 text-left",
                isSelected 
                  ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm" 
                  : "border-transparent bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl mb-4 transition-colors",
                isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className={cn("font-semibold text-lg", isSelected ? "text-blue-700" : "text-gray-900")}>
                {role.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{role.desc}</p>
              
              {isSelected && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={onNext}
          disabled={!data.role}
          className="rounded-2xl px-8 h-12"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
};

const GoalsStep = ({ data, update, onNext }: { data: OnboardingData; update: UpdateFn; onNext: () => void }) => {
  const goals = [
    { id: "efficiency", label: "Effizienz steigern", icon: Zap },
    { id: "automation", label: "Prozesse automatisieren", icon: Rocket },
    { id: "leads", label: "Mehr Leads generieren", icon: User },
    { id: "overview", label: "Besseren Überblick", icon: LayoutGrid },
  ];

  const toggleGoal = (id: string) => {
    const newGoals = data.goals.includes(id)
      ? data.goals.filter(g => g !== id)
      : [...data.goals, id];
    update("goals", newGoals);
  };

  return (
    <div className="space-y-8 w-full max-w-xl mx-auto animate-in slide-in-from-right-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-[#1D1D1F]">Was möchtest du erreichen?</h2>
        <p className="text-[#86868B]">Wähle alles aus, was zutrifft.</p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = data.goals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
                isSelected 
                  ? "border-blue-500 bg-blue-50/30 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn("font-medium flex-1 text-left", isSelected ? "text-blue-900" : "text-gray-700")}>
                {goal.label}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"
              )}>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={onNext}
          disabled={data.goals.length === 0}
          className="rounded-2xl px-8 h-12"
        >
          Fertigstellen
        </Button>
      </div>
    </div>
  );
};

const SuccessStep = () => (
  <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-700">
    <div className="w-32 h-32 relative">
      <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
      <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
        <Check className="w-16 h-16 text-white" />
      </div>
    </div>
    <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Alles eingerichtet!</h1>
    <p className="text-lg text-[#86868B] max-w-md">
      Dein Workspace ist bereit. Wir leiten dich weiter...
    </p>
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Lade Dashboard</span>
    </div>
  </div>
);

// --- Main Page ---

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    role: "",
    goals: []
  });

  const updateData: UpdateFn = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (step === 3) {
      // Final step submission simulation
      setStep(4);
      setTimeout(() => {
        router.push("/"); // Redirect to dashboard
      }, 2000);
    } else {
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {step > 0 && step < 4 && (
          <div className="absolute top-0 left-0 right-0 -mt-16 flex justify-center">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i <= step ? "w-8 bg-black" : "w-2 bg-gray-300"
                  )} 
                />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {step === 0 && <WelcomeStep onNext={handleNext} />}
            {step === 1 && <NameStep data={data} update={updateData} onNext={handleNext} />}
            {step === 2 && <RoleStep data={data} update={updateData} onNext={handleNext} />}
            {step === 3 && <GoalsStep data={data} update={updateData} onNext={handleNext} />}
            {step === 4 && <SuccessStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
