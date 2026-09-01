import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Beaker } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'staff' | 'client'>('staff');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="bg-white/[0.04] backdrop-blur-2xl w-full max-w-md p-8 rounded-3xl relative z-10 shadow-[0_8px_32px_0_rgba(124,58,237,0.15)] border border-white/10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Activity className="h-8 w-8 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AquaLab</h1>
          <p className="text-purple-200/50 text-sm mt-1">Laboratory Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('staff')}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                loginType === 'staff' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-purple-200/50 hover:text-purple-200'
              }`}
            >
              Office Staff
            </button>
            <button
              type="button"
              onClick={() => setLoginType('client')}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                loginType === 'client' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-purple-200/50 hover:text-purple-200'
              }`}
            >
              Client Portal
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="identifier" className="block text-sm font-medium text-purple-200/70">
              {loginType === 'staff' ? 'Employee ID' : 'Client Email'}
            </label>
            <Input 
              id="identifier" 
              type={loginType === 'client' ? 'email' : 'text'} 
              placeholder={loginType === 'staff' ? 'e.g. EMP-2024' : 'e.g. admin@citywater.gov'} 
              required
              className="bg-black/40 border-white/10 text-white placeholder:text-purple-200/30 focus-visible:ring-purple-500 focus-visible:border-purple-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-purple-200/70">Password</label>
              <a href="#" className="text-xs font-medium text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              required
              className="bg-black/40 border-white/10 text-white placeholder:text-purple-200/30 focus-visible:ring-purple-500 focus-visible:border-purple-500"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-purple-200/40">
          Secure Environmental Data Portal • v2.0.4
        </div>
      </div>
    </div>
  );
};
