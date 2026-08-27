import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Beaker, ShieldCheck, Activity, ArrowRight, Droplets, Map } from 'lucide-react';
import { WaterBackground } from '../components/WaterBackground';

export const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-6 bg-transparent select-none cursor-default">
      <WaterBackground />
      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center">
        
        <div className="mb-12 animate-in slide-in-from-bottom-10 fade-in duration-1000">
          <div className="p-4 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(124,58,237,0.15)]">
            <Beaker className="w-16 h-16 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-md">
          Next-Gen Water Quality <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Intelligence</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-purple-200/70 max-w-2xl font-light">
          A high-performance laboratory information management system designed for speed, compliance, and real-time geospatial monitoring.
        </p>

        <div className="mt-12 flex gap-6 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-150">
          <Link to="/intro" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(147,51,234,0.4)] border border-purple-500/50 transition-all flex items-center">
            View System Tour
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center backdrop-blur-md">
            Login Portal
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300">
          {[
            { icon: Droplets, title: "Precision Logging", desc: "Automated compliance checks with instant violation alerts." },
            { icon: Activity, title: "Real-time Dashboards", desc: "Live KPI tracking and dynamic metric visualizations." },
            { icon: Map, title: "Geospatial Tracking", desc: "Interactive source mapping with live sensor status." }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-[0_8px_32px_0_rgba(124,58,237,0.1)] hover:border-purple-500/50 transition-colors">
              <feature.icon className="w-10 h-10 text-purple-400 mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-purple-200/50 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
