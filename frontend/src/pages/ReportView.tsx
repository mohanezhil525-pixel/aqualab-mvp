import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle2, Send, X, Mail } from 'lucide-react';
import { useLabContext } from '../context/LabContext';
import { exportToPDF } from '../lib/pdfGenerator';

export const ReportView = () => {
  const { samples, updateSampleStatus, addAuditLog, parameters, sampleResults } = useLabContext();
  
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set());

  // Show only samples that are in Testing or Completed
  const visibleSamples = samples.filter(s => s.status === 'IN_TESTING' || s.status === 'COMPLETED' || s.status === 'REVIEW_PENDING');

  const handleDownload = (sample: any) => {
    if (sample.status !== 'COMPLETED') {
      updateSampleStatus(sample.id, 'COMPLETED');
      addAuditLog(`Report approved for ${sample.sampleNumber}`, 'check', 'text-emerald-500', 'REPORT_APPROVED', `Sample ${sample.sampleNumber}`);
    } else {
      const results = sampleResults[sample.sampleNumber] || {};
      exportToPDF(sample, results, parameters);
      addAuditLog(`Downloaded PDF for ${sample.sampleNumber}`, 'download', 'text-purple-400', 'REPORT_GENERATED', `Sample ${sample.sampleNumber}`);
    }
  };

  const handleSendMessage = () => {
    addAuditLog(`Report sent to ${selectedSample.client}`, 'mail', 'text-blue-400', 'MESSAGE_SENT', `Sample ${selectedSample.sampleNumber}`);
    setIsMessageSent(true);
    setSentMessages(prev => new Set(prev).add(selectedSample.id));
    setTimeout(() => {
      setIsMessageOpen(false);
      setSelectedSample(null);
      setIsMessageSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Reports & Sign-off</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleSamples.map(sample => (
          <GlassCard key={sample.id} className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-lg font-bold text-white drop-shadow-sm">{sample.sampleNumber}</h3>
              <FileText className="h-4 w-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>
            <div>
              <div className="space-y-2 mt-2">
                <div className="text-sm text-purple-200/70">Client: <span className="font-medium text-slate-100">{sample.client}</span></div>
                <div className="text-sm text-purple-200/70">Type: <span className="font-medium text-slate-100">{sample.type}</span></div>
                <div className="text-sm text-purple-200/70">
                  Status: 
                  <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    sample.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  }`}>
                    {sample.status}
                  </span>
                </div>
                
                {sample.status === 'COMPLETED' ? (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50"
                      onClick={() => handleDownload(sample)}
                    >
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button 
                      variant="outline"
                      className={`w-full transition-all duration-300 ${
                        sentMessages.has(sample.id) 
                          ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                          : 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-purple-400'
                      }`}
                      onClick={() => { setSelectedSample(sample); setIsMessageOpen(true); }}
                      disabled={sentMessages.has(sample.id)}
                    >
                      {sentMessages.has(sample.id) ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Sent</> : <><Send className="mr-2 h-4 w-4" /> Message</>}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    onClick={() => handleDownload(sample)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Preview & Approve
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Message Client Modal */}
      {isMessageOpen && selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <GlassCard className="w-full max-w-lg p-6 shadow-[0_0_50px_rgba(147,51,234,0.15)]">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Mail className="mr-2 h-6 w-6 text-purple-400" /> Send Report
              </h2>
              <button onClick={() => setIsMessageOpen(false)} className="text-purple-200/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-purple-200/70 mb-1">To:</div>
                <div className="font-semibold text-white">{selectedSample.client}</div>
                <div className="text-xs text-purple-200/50 mt-1">contact@{selectedSample.client.toLowerCase().replace(/\s+/g, '')}.com</div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-4 border border-purple-500/20">
                <div className="text-sm text-purple-200/70 mb-2">Message Preview:</div>
                <p className="text-sm text-purple-100 font-light leading-relaxed">
                  Hello {selectedSample.client},<br/><br/>
                  The water quality analysis report for your sample <strong className="text-white">{selectedSample.sampleNumber}</strong> (collected at {selectedSample.sourceLocation}) is now complete and attached.<br/><br/>
                  Please review the attached PDF for full parameter breakdown and compliance status.<br/><br/>
                  Regards,<br/>AquaLab Team
                </p>
                <div className="mt-4 flex items-center text-xs text-purple-300 bg-purple-900/30 p-2 rounded border border-purple-500/30 w-max">
                  <FileText className="w-3 h-3 mr-2" /> {selectedSample.sampleNumber}_Final_Report.pdf
                </div>
              </div>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={isMessageSent}
                className={`w-full text-white mt-2 transition-all duration-300 ${
                  isMessageSent 
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.5)]'
                }`}
              >
                {isMessageSent ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Message Sent!</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Message</>
                )}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
