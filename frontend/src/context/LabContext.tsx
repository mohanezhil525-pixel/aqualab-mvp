import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Beaker, Plus, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface LabContextType {
  samples: any[];
  addSample: (sample: any) => void;
  updateSampleStatus: (id: string, status: string) => void;
  auditLogs: any[];
  addAuditLog: (text: string, iconType?: string, color?: string) => void;
  stations: any[];
  currentUser: any;
  trendData: any[];
  distributionData: any[];
  parameters: any[];
  sampleResults: Record<string, Record<string, string>>;
  updateSampleResults: (sampleId: string, results: Record<string, string>) => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider = ({ children }: { children: ReactNode }) => {
  const dateDistribution = [
    'Aug 1', 'Aug 1', 'Aug 1', 
    'Aug 8', 'Aug 8', 'Aug 8', 'Aug 8', 'Aug 8', 'Aug 8', 
    'Aug 15', 'Aug 15', 'Aug 15', 'Aug 15',
    'Aug 22', 'Aug 22', 'Aug 22', 'Aug 22', 'Aug 22', 'Aug 22', 'Aug 22',
    'Aug 29', 'Aug 29', 'Aug 29', 'Aug 29', 'Aug 29'
  ];

  const initialSamples = Array.from({ length: 25 }).map((_, i) => ({
    id: `${i+1}`,
    sampleNumber: `WTR-2026-${1000 + i}`,
    client: ['Tata Chemicals', 'Acme Corp', 'Global Water', 'Aqua Pure', 'City Municipality'][i % 5],
    sourceLocation: ['Chennai', 'Delhi', 'Pune', 'Kolkata', 'Mumbai'][i % 5],
    type: ['Drinking Water', 'Surface Water', 'Groundwater', 'Industrial'][i % 4],
    status: i < 20 ? 'COMPLETED' : i < 23 ? 'IN_TESTING' : 'RECEIVED',
    date: dateDistribution[i]
  }));

  const initialResults = initialSamples.reduce((acc, sample) => {
    if (sample.status === 'COMPLETED') {
      const isBreach = Math.random() > 0.8;
      acc[sample.sampleNumber] = {
        'pH': isBreach ? '9.0' : '7.2',
        'Turbidity': isBreach ? '6.0' : '2.1',
        'Lead': '0.005',
        'E. coli': isBreach ? '5' : '0',
        'Nitrates': '4.5',
        'Total Dissolved Solids': '250',
        'Hardness': '120',
        'Free Chlorine': '1.5'
      };
    }
    return acc;
  }, {} as Record<string, Record<string, string>>);

  const [samples, setSamples] = useState<any[]>(initialSamples);
  const [sampleResults, setSampleResults] = useState<Record<string, Record<string, string>>>(initialResults);
  
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 1, text: 'Jane D. uploaded test results for WTR-2026-1019', time: '2m ago', iconType: 'beaker', color: 'text-blue-500', timestamp: '2026-08-25 10:15:00', user: 'Jane Technician', action: 'TEST_RESULTS_ENTERED', entity: 'Sample WTR-2026-1019' },
    { id: 2, text: 'System flagged pH breach at Yamuna Station', time: '15m ago', iconType: 'alert', color: 'text-red-500', timestamp: '2026-08-25 10:10:00', user: 'System', action: 'ALERT_TRIGGERED', entity: 'Yamuna Station' },
    { id: 3, text: 'John M. generated monthly compliance audit report', time: '1h ago', iconType: 'check', color: 'text-emerald-500', timestamp: '2026-08-24 14:30:00', user: 'John Manager', action: 'REPORT_GENERATED', entity: 'System' },
  ]);
  
  const currentUser = {
    name: 'Jane Technician',
    role: 'Senior Quality Analyst',
    id: 'LAB-8842',
    unit: 'Chennai Central Water Lab',
    shift: 'Morning Shift'
  };

  const stations = [
    { id: '1', name: 'Chennai (Ennore Coastal Intake)', coords: [13.2000, 80.3200], status: 'Safe', breach: false },
    { id: '2', name: 'Delhi (Yamuna Monitoring Station 4)', coords: [28.6139, 77.2090], status: 'Breach', breach: true, detail: 'High Ammonia' },
    { id: '3', name: 'Pune (Mula-Mutha River Basin)', coords: [18.5204, 73.8567], status: 'Warning', breach: false, detail: 'Turbidity' },
    { id: '4', name: 'Kolkata (Hooghly Water Treatment)', coords: [22.5726, 88.3639], status: 'Safe', breach: false },
    { id: '5', name: 'Mumbai (Vaitarna Reservoir)', coords: [19.0760, 72.8777], status: 'Safe', breach: false },
    { id: '6', name: 'Bengaluru (Bellandur Lake Point)', coords: [12.9716, 77.5946], status: 'Breach', breach: true, detail: 'Chemical Oxygen Demand' },
    { id: '7', name: 'Hyderabad (Hussain Sagar Outlet)', coords: [17.3850, 78.4867], status: 'Warning', breach: false },
    { id: '8', name: 'Ahmedabad (Sabarmati Riverfront)', coords: [23.0225, 72.5714], status: 'Safe', breach: false },
    { id: '9', name: 'Varanasi (Ganga Basin Station 2)', coords: [25.3176, 82.9739], status: 'Breach', breach: true, detail: 'Coliform' },
    { id: '10', name: 'Kochi (Vembanad Backwaters)', coords: [9.9312, 76.2673], status: 'Safe', breach: false },
  ];

  const parameters = [
    { id: '1', name: 'pH', unit: 'pH', min: 6.5, max: 8.5 },
    { id: '2', name: 'Turbidity', unit: 'NTU', min: 0, max: 5 },
    { id: '3', name: 'Lead', unit: 'mg/L', min: 0, max: 0.01 },
    { id: '4', name: 'E. coli', unit: 'CFU/100mL', min: 0, max: 0 },
    { id: '5', name: 'Nitrates', unit: 'mg/L', min: 0, max: 10 },
    { id: '6', name: 'Total Dissolved Solids', unit: 'mg/L', min: 0, max: 500 },
    { id: '7', name: 'Hardness', unit: 'mg/L', min: 0, max: 200 },
    { id: '8', name: 'Free Chlorine', unit: 'mg/L', min: 0.2, max: 4.0 },
  ];

  const distributionMap = samples.reduce((acc, sample) => {
    acc[sample.type] = (acc[sample.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const distributionData = Object.entries(distributionMap).map(([name, value]) => ({ name, value }));

  const trendMap = samples.reduce((acc, sample) => {
    if (!sample.date) return acc;
    if (!acc[sample.date]) acc[sample.date] = { date: sample.date, tests: 0, breaches: 0 };
    acc[sample.date].tests += 1;
    
    let hasBreach = false;
    const results = sampleResults[sample.sampleNumber];
    if (results) {
      parameters.forEach(p => {
        const valStr = results[p.name];
        if (valStr) {
          const val = parseFloat(valStr);
          if (val < p.min || val > p.max) hasBreach = true;
        }
      });
    }
    if (hasBreach) acc[sample.date].breaches += 1;
    
    return acc;
  }, {} as Record<string, { date: string, tests: number, breaches: number }>);
  
  const order = ['Aug 1', 'Aug 8', 'Aug 15', 'Aug 22', 'Aug 29'];
  const trendData = order.map(date => trendMap[date] || { date, tests: 0, breaches: 0 });

  const addSample = (sample: any) => {
    setSamples(prev => [sample, ...prev]);
    addAuditLog(`Sample ${sample.sampleNumber} registered`, 'plus', 'text-blue-500', 'REGISTERED', `Sample ${sample.sampleNumber}`);
  };

  const updateSampleStatus = (id: string, status: string) => {
    setSamples(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const updateSampleResults = (sampleId: string, results: Record<string, string>) => {
    setSampleResults(prev => ({ ...prev, [sampleId]: results }));
  };

  const addAuditLog = (text: string, iconType = 'activity', color = 'text-blue-500', action = 'SYSTEM_EVENT', entity = 'System') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAuditLogs(prev => [{ 
      id: Date.now(), 
      text, 
      time: 'Just now', 
      iconType, 
      color,
      timestamp,
      user: currentUser.name,
      action,
      entity
    }, ...prev]);
  };

  return (
    <LabContext.Provider value={{ samples, addSample, updateSampleStatus, auditLogs, addAuditLog, stations, currentUser, trendData, distributionData, parameters, sampleResults, updateSampleResults }}>
      {children}
    </LabContext.Provider>
  );
};

export const useLabContext = () => {
  const context = useContext(LabContext);
  if (context === undefined) {
    throw new Error('useLabContext must be used within a LabProvider');
  }
  return context;
};
