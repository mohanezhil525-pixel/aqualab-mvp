import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Droplets, ShieldCheck, Map, CheckCircle2 } from 'lucide-react';
import { WaterBackground } from '../components/WaterBackground';

export const IntroPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Geospatial Monitoring",
      desc: "Live map of India tracking water quality across all intake stations in real-time.",
      icon: <Map className="w-24 h-24 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
    },
    {
      title: "Instant Compliance",
      desc: "Automatically checks entered metrics against government compliance parameters. No manual math.",
      icon: <ShieldCheck className="w-24 h-24 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
    },
    {
      title: "One-Click Reports",
      desc: "Generate professional PDF reports with embedded charts instantly from the dashboard.",
      icon: <CheckCircle2 className="w-24 h-24 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
    }
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <WaterBackground />

      <div className="bg-white/[0.04] backdrop-blur-2xl max-w-2xl w-full rounded-3xl p-8 relative z-10 text-center flex flex-col items-center shadow-[0_8px_32px_0_rgba(124,58,237,0.15)] border border-white/10 min-h-[400px]">
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-10 duration-500 w-full" key={step}>
          <div className="mb-8">{slides[step].icon}</div>
          <h2 className="text-3xl font-extrabold text-white mb-4">{slides[step].title}</h2>
          <p className="text-purple-200/70 text-lg max-w-md">{slides[step].desc}</p>
        </div>

        <div className="flex items-center justify-between w-full mt-12">
          <Button 
            variant="ghost" 
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-purple-200/50 hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
          
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-white/10'}`} />
            ))}
          </div>

          {step === slides.length - 1 ? (
            <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => setStep(step + 1)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              Next <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
