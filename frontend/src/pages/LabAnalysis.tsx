import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Download } from 'lucide-react';
import { useLabContext } from '../context/LabContext';
import { exportToPDF } from '../lib/pdfGenerator';

export const LabAnalysis = () => {
  const [selectedSample, setSelectedSample] = useState('WTR-2026-0001');

  const { samples, updateSampleStatus, addAuditLog, parameters, sampleResults, updateSampleResults } = useLabContext();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSample = samples.find(s => s.sampleNumber === selectedSample) || samples[0];
  const results = sampleResults[activeSample.sampleNumber] || {};

  const handleResultChange = (paramId: string, value: string) => {
    updateSampleResults(activeSample.sampleNumber, { ...results, [paramId]: value });
  };

  const handleSave = () => {
    updateSampleStatus(activeSample.id, 'COMPLETED');
    addAuditLog(`Batch results logged for ${activeSample.sampleNumber}`, 'check', 'text-emerald-500', 'RESULTS_SAVED', `Sample ${activeSample.sampleNumber}`);
    setToastMessage('Batch results saved successfully! Generating audit logs...');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => {
    exportToPDF(activeSample, results, parameters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Lab Analysis</h1>
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search Sample ID..." 
            value={selectedSample}
            onChange={(e) => setSelectedSample(e.target.value)}
            className="w-64 bg-black/40 border-white/10 text-white placeholder-purple-200/30 focus-visible:ring-purple-500"
          />
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Data Entry: {selectedSample}</h2>
          <p className="text-purple-200/70 text-sm mt-1">Enter measured values. Compliance is calculated automatically.</p>
        </div>
        
        <div className="rounded-xl overflow-hidden border border-purple-500/30">
          <Table>
            <TableHeader className="bg-purple-950/40">
              <TableRow className="border-b border-purple-500/20 hover:bg-transparent">
                <TableHead className="text-purple-300 font-semibold">Parameter</TableHead>
                <TableHead className="text-purple-300 font-semibold">Limits</TableHead>
                <TableHead className="text-purple-300 font-semibold">Measured Value</TableHead>
                <TableHead className="text-purple-300 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param, index) => {
                const val = parseFloat(results[param.id] || '0');
                const hasValue = results[param.id] !== undefined && results[param.id] !== '';
                const isCompliant = hasValue && val >= param.min && val <= param.max;

                return (
                  <TableRow key={param.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-slate-100">{param.name} <span className="text-slate-400 text-xs">({param.unit})</span></TableCell>
                    <TableCell className="text-slate-300">{param.min} - {param.max}</TableCell>
                    <TableCell>
                      <Input 
                        id={`param-input-${index}`}
                        type="number" 
                        step="0.01"
                        className={`w-32 bg-slate-900/80 border-purple-500/40 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 ${
                          hasValue 
                            ? isCompliant 
                              ? 'border-emerald-500/50 text-emerald-300 focus-visible:ring-emerald-500' 
                              : 'border-rose-500/50 text-rose-300 font-bold focus-visible:ring-rose-500'
                            : ''
                        }`} 
                        value={results[param.id] || ''}
                        onChange={(e) => handleResultChange(param.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextInput = document.getElementById(`param-input-${index + 1}`);
                            if (nextInput) {
                              nextInput.focus();
                            }
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {!hasValue ? (
                        <span className="text-slate-500 font-medium">Pending</span>
                      ) : isCompliant ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Pass</span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]">Fail</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={handleExport} variant="outline" className="border-purple-500/30 bg-purple-900/20 text-purple-200 hover:bg-purple-800/40 hover:text-white">
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50">
              <Save className="mr-2 h-4 w-4" /> Save Batch Results
            </Button>
          </div>
      </GlassCard>
      
      {/* Simple Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-2xl shadow-[0_8px_32px_0_rgba(124,58,237,0.3)] flex items-center animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse shadow-[0_0_8px_#a855f7]"></div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
