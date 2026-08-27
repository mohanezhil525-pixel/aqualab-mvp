import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Beaker, FileText, Activity, LogOut, FileSignature, Map, X, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationsPopover } from './NotificationsPopover';
import { useLabContext } from '../context/LabContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useLabContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = () => {
    // In MVP, simply redirect to login and simulate session clear
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Source Map', href: '/map', icon: Map },
    { name: 'Sample Registration', href: '/samples/new', icon: FileSignature },
    { name: 'Lab Analysis', href: '/lab', icon: Beaker },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Compliance', href: '/compliance', icon: Activity },
  ];

  return (
    <div className="flex h-screen font-sans text-slate-100 bg-[#07070D] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-black">
      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-black/60 backdrop-blur-2xl border-r border-white/10 pt-5">
          <div className="flex flex-shrink-0 items-center px-4 select-none cursor-default">
            <Droplets className="h-8 w-8 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="ml-2 text-xl font-bold text-white tracking-tight">AquaLab</span>
          </div>
          <div className="mt-8 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-4">
              {navigation.map((item) => {
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/40 to-violet-600/20 text-white border-l-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                          : 'text-purple-200/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                      )
                    }
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        location.pathname === item.href ? 'text-purple-400' : 'text-purple-200/50 group-hover:text-purple-300'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-transparent md:pl-64">
        {/* Navbar for mobile and top actions */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-black/40 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            
            {/* Top Right Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-purple-200/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                title="Start Page"
              >
                <LayoutDashboard className="h-5 w-5" />
              </button>
              <NotificationsPopover />
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/50 border border-purple-500/50 text-purple-300 hover:bg-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  JD
                </button>

                {/* Profile Glass Card Popover */}
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(124,58,237,0.15)] p-4 z-50 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold text-lg">JD</div>
                          <div>
                            <p className="font-semibold text-white leading-tight">{currentUser?.name || 'Jane Tech'}</p>
                            <p className="text-xs text-purple-200/70">{currentUser?.role || 'Analyst'}</p>
                          </div>
                        </div>
                        <button onClick={() => setIsProfileOpen(false)} className="text-purple-200/50 hover:text-white"><X className="h-4 w-4" /></button>
                      </div>
                      
                      <div className="space-y-2 mb-4 mt-4 text-sm bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex justify-between"><span className="text-purple-200/70">Employee ID</span><span className="font-medium text-white">{currentUser?.id}</span></div>
                        <div className="flex justify-between"><span className="text-purple-200/70">Unit</span><span className="font-medium text-white text-right w-24 truncate">{currentUser?.unit}</span></div>
                        <div className="flex justify-between"><span className="text-purple-200/70">Shift</span><span className="font-medium text-white">{currentUser?.shift}</span></div>
                      </div>

                      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-medium rounded-lg py-2 transition-colors border border-rose-500/30">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
