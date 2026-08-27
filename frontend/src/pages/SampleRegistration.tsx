import { useState } from 'react';
import { useLabContext } from '../context/LabContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SampleRegistration = () => {
  const { addSample } = useLabContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    sourceLocation: '',
    sampleType: 'DRINKING_WATER',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique Sample ID
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const sampleNumber = `WTR-2026-${randomId}`;

    const newSample = {
      id: Date.now().toString(),
      sampleNumber,
      client: formData.clientName,
      sourceLocation: formData.sourceLocation,
      type: formData.sampleType.replace('_', ' '),
      status: 'RECEIVED'
    };

    addSample(newSample);
    
    // Reset and redirect
    setFormData({ clientName: '', clientContact: '', sourceLocation: '', sampleType: 'DRINKING_WATER' });
    navigate('/lab');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Register New Sample</h1>
      
      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Sample Details</h2>
          <p className="text-purple-200/70 text-sm mt-1">Enter client and source information to initiate testing.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Client Name</label>
            <Input 
              required 
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              placeholder="Acme Corp"
              className="bg-slate-900/80 border-purple-500/40 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 placeholder:text-slate-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Client Contact</label>
            <Input 
              required 
              value={formData.clientContact}
              onChange={e => setFormData({...formData, clientContact: e.target.value})}
              placeholder="contact@acme.com" 
              className="bg-slate-900/80 border-purple-500/40 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 placeholder:text-slate-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Source Location</label>
            <Input 
              required 
              value={formData.sourceLocation}
              onChange={e => setFormData({...formData, sourceLocation: e.target.value})}
              placeholder="Well #4, East Wing" 
              className="bg-slate-900/80 border-purple-500/40 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Sample Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-purple-500/40 bg-slate-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              value={formData.sampleType}
              onChange={e => setFormData({...formData, sampleType: e.target.value})}
            >
              <option value="DRINKING_WATER" className="bg-slate-900">Drinking Water</option>
              <option value="INDUSTRIAL" className="bg-slate-900">Industrial Runoff</option>
              <option value="WASTEWATER" className="bg-slate-900">Wastewater</option>
            </select>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
            <Beaker className="mr-2 h-4 w-4" /> Register Sample
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
