import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLabContext } from '../context/LabContext';

export const NotificationsPopover = () => {
  const { auditLogs } = useLabContext();
  const [clearedTime, setClearedTime] = useState<number>(0);
  
  // Only show notifications that occurred after the last 'Mark all as read'
  // Since auditLogs uses Date.now() for id for new ones, we can compare id to clearedTime
  // For the initial mock data (id: 1, 2, 3), we treat them as timestamp 0.
  const visibleLogs = auditLogs.filter(log => log.id > clearedTime).slice(0, 10);
  
  const [unreadCount, setUnreadCount] = useState(visibleLogs.length);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setUnreadCount(visibleLogs.length);
  }, [visibleLogs.length]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = () => {
    setClearedTime(Date.now());
    setUnreadCount(0);
    // Don't close immediately, let them see it empty
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative text-purple-200/50 hover:text-white hover:bg-white/10 border-0"
        onClick={handleOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-black" />
        )}
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed top-0 left-0 w-screen h-screen z-40 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-black/80 backdrop-blur-2xl shadow-[0_0_30px_rgba(124,58,237,0.2)] z-50 flex flex-col border-l border-white/10 animate-in slide-in-from-right">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h4 className="font-semibold text-white">Notifications</h4>
              <button onClick={() => setIsOpen(false)} className="text-purple-200/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {visibleLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-purple-200/50 p-6 text-center">
                  <Bell className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No messages</p>
                  <p className="text-xs mt-1 opacity-70">You're all caught up!</p>
                </div>
              ) : (
                visibleLogs.map((log: any) => (
                  <div key={log.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-semibold ${log.color}`}>
                        {log.action || 'System Event'}
                      </span>
                      <span className="text-xs text-purple-200/50">{log.time}</span>
                    </div>
                    <p className="text-sm text-purple-200/70">{log.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 text-center border-t border-white/10 bg-white/5">
              <button 
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMarkAllRead}
                disabled={visibleLogs.length === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
