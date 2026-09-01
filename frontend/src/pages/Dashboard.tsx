import React, { useState } from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Calendar, MapPin, Droplets, Plus, Beaker, Download, AlertCircle, ArrowRight, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLabContext } from '../context/LabContext';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#a855f7', '#10b981', '#3b82f6', '#e11d48']; // Purple, Emerald, Blue, Rose

const createStatusIcon = (isBreach: boolean) => L.divIcon({
  className: 'bg-transparent',
  html: `<div style="background-color: ${isBreach ? '#e11d48' : '#a855f7'}; width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); box-shadow: 0 0 10px ${isBreach ? 'rgba(225,29,72,0.8)' : 'rgba(168,85,247,0.8)'};"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export const Dashboard = () => {
  const navigate = useNavigate();
  const { auditLogs, stations, trendData, distributionData, addSample, addAuditLog, samples: allSamples, sampleResults, parameters, userRole } = useLabContext();
  
  const clientName = 'Acme Corp';
  const samples = userRole === 'staff' ? allSamples : allSamples.filter(s => s.client === clientName);
  
  const activeSamplesCount = samples.filter(s => s.status !== 'COMPLETED').length;
  const completedSamplesCount = samples.filter(s => s.status === 'COMPLETED').length;
  
  const activeLoad = activeSamplesCount;
  const totalCompleted = completedSamplesCount;

  // Dynamic WQI & Non-Compliance Calculation
  let nonCompliantCount = 0;
  let totalTestsCompleted = 0;
  let totalScore = 0;

  samples.forEach(sample => {
    if (sample.status === 'COMPLETED') {
      totalTestsCompleted++;
      let hasBreach = false;
      let sampleScore = 100;
      const results = sampleResults[sample.sampleNumber] || {};
      parameters.forEach(p => {
        const valStr = results[p.name];
        if (valStr) {
          const val = parseFloat(valStr);
          if (val < p.min || val > p.max) {
            hasBreach = true;
            sampleScore -= 15; // penalize score per breach
          }
        }
      });
      if (hasBreach) nonCompliantCount++;
      totalScore += Math.max(0, sampleScore);
    }
  });

  const nonComplianceRate = totalTestsCompleted > 0 
    ? ((nonCompliantCount / totalTestsCompleted) * 100).toFixed(1) 
    : '0.0';

  const wqi = totalTestsCompleted > 0 
    ? Math.round(totalScore / totalTestsCompleted) 
    : 100;

  const wqiStatus = wqi >= 90 ? 'Optimal / Safe Status' : wqi >= 70 ? 'Moderate Quality' : 'Critical Warning';
  const wqiColor = wqi >= 90 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : wqi >= 70 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]';
  const wqiHex = wqi >= 90 ? 'text-emerald-400' : wqi >= 70 ? 'text-amber-400' : 'text-rose-400';
  const WqiIcon = wqi >= 90 ? Activity : wqi >= 70 ? AlertTriangle : AlertCircle;
  
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [location, setLocation] = useState('All Facilities');
  const [waterType, setWaterType] = useState('All Sample Types');

  // Modal States
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLogResultsOpen, setIsLogResultsOpen] = useState(false);

  // Form State for Register
  const [regForm, setRegForm] = useState({ client: '', source: '', type: 'Drinking Water' });

  // Alert State
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('AquaLab System', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Daily Compliance & Operations Report', 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    (doc as any).autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Water Quality Index', `${wqi} / 100 (${wqiStatus})`],
        ['Active Load', `${activeLoad} Samples`],
        ['Non-Compliance Rate', `${nonComplianceRate}%`],
        ['Total Completed', `${totalCompleted}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247] } // Purple header
    });

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Station', 'Status', 'Details']],
      body: stations.filter(s => s.breach).map(s => [s.name, s.status, s.detail]),
      theme: 'grid',
      headStyles: { fillColor: [225, 29, 72] } // Rose header
    });

    doc.save('AquaLab_Daily_Report.pdf');
    addAuditLog(`Generated PDF Summary Report`, 'download', 'text-purple-400');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSample = {
      id: Date.now().toString(),
      sampleNumber: `WTR-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      client: regForm.client,
      sourceLocation: regForm.source,
      type: regForm.type,
      status: 'RECEIVED'
    };
    addSample(newSample);
    setIsRegisterOpen(false);
    setRegForm({ client: '', source: '', type: 'Drinking Water' });
    navigate('/lab');
  };

  return (
    <div className="space-y-6 pb-8 relative">
      {/* Critical Alert Ticker */}
      {stations.some(s => s.breach) && !isAlertAcknowledged && (
        <div className="bg-rose-950/40 backdrop-blur-md border-l-4 border-rose-500 p-4 rounded-r-2xl flex flex-wrap items-center justify-between shadow-[0_0_30px_rgba(225,29,72,0.15)]">
          <div className="flex items-center text-rose-100">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 animate-pulse text-rose-500" />
            <span className="font-bold mr-2">CRITICAL ALERT:</span>
            <span>{stations.find(s => s.breach)?.detail} breach detected at {stations.find(s => s.breach)?.name} — 18 minutes ago</span>
          </div>
          <Button onClick={() => setIsIncidentOpen(true)} variant="ghost" className="text-rose-200 hover:bg-rose-900/50 hover:text-white font-bold whitespace-nowrap ml-4 border border-rose-500/30">
            View Incident
          </Button>
        </div>
      )}

      {/* Global Filter Header & Quick Actions */}
      <GlassCard className="flex flex-col gap-6 p-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{userRole === 'staff' ? 'Dashboard' : 'My Dashboard'}</h1>
          <p className="text-purple-200/70 text-sm">{userRole === 'staff' ? 'System Overview and Key Metrics' : `${clientName} - Dedicated Client Portal`}</p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Calendar className="h-4 w-4 text-purple-300" />
              <select className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer [&>option]:bg-slate-900" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <MapPin className="h-4 w-4 text-purple-300" />
              <select className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer [&>option]:bg-slate-900" value={location} onChange={e => setLocation(e.target.value)}>
                <option>All Facilities</option>
                <option>Chennai Intake</option>
                <option>Delhi Yamuna</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userRole === 'staff' && (
              <>
                <Button onClick={() => setIsRegisterOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50">
                  <Plus className="mr-2 h-4 w-4" /> Register Sample
                </Button>
                <Button onClick={() => setIsLogResultsOpen(true)} variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-purple-400 shadow-sm backdrop-blur-md">
                  <Beaker className="mr-2 h-4 w-4" /> Log Results
                </Button>
              </>
            )}
            <Button onClick={handleExportPDF} variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-purple-400 shadow-sm backdrop-blur-md">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Key Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 select-none cursor-default">
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200/70">Water Quality Index</CardTitle>
            <WqiIcon className={`h-4 w-4 ${wqiColor}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-extrabold text-white text-shadow-sm">{wqi}</div>
              <div className="text-sm font-medium text-purple-200/50 mb-1">/ 100</div>
            </div>
            <p className={`text-xs font-semibold ${wqiHex} mt-1`}>{wqiStatus}</p>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200/70">Non-Compliance Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-400 text-shadow-sm">{nonComplianceRate}%</div>
            <p className="text-xs text-purple-200/50 mt-1">Of total samples tested</p>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200/70">{userRole === 'staff' ? 'Active Load' : 'My Active Samples'}</CardTitle>
            <Beaker className="h-4 w-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white text-shadow-sm">{activeLoad}</div>
            <div className="w-full bg-white/10 rounded-full h-2.5 mt-2 overflow-hidden border border-white/5">
              <div className="bg-purple-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: `${Math.min(activeLoad * 10, 100)}%` }}></div>
            </div>
            <p className="text-xs text-purple-300 font-medium mt-2">{Math.min(activeLoad * 10, 100)}% Capacity</p>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200/70">Total Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white text-shadow-sm">{totalCompleted}</div>
            <p className="text-xs text-purple-200/50 mt-1">Finalized reports generated</p>
          </CardContent>
        </GlassCard>
      </div>

      {/* Middle Section */}
      <div className="grid gap-6 lg:grid-cols-3 select-none cursor-default">
        <GlassCard className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-white">Compliance Trend ({dateRange})</CardTitle>
            <CardDescription className="text-purple-200/70">Total tests vs non-compliant breaches over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} />
                <Tooltip itemStyle={{ color: '#fff' }} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.5)' }} />
                <Line type="monotone" dataKey="tests" name="Total Tests" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 2}} activeDot={{r: 6, fill: '#a855f7', stroke: '#fff'}} />
                <Line type="monotone" dataKey="breaches" name="Breaches" stroke="#e11d48" strokeWidth={3} dot={{r: 4, fill: '#0f172a', strokeWidth: 2}} activeDot={{r: 6, fill: '#e11d48', stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>

        <div className="col-span-1 flex flex-col gap-6">
          <GlassCard className="flex-1">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white">Sample Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="rgba(255,255,255,0.1)">
                      {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip itemStyle={{ color: '#fff' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.9)', color: '#fff', boxShadow: '0 10px 25px -3px rgba(0,0,0,0.5)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {distributionData.map((d, i) => (
                  <div key={d.name} className="flex items-center text-xs text-purple-200/70">
                    <div className="w-2 h-2 rounded-full mr-2 shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}`}}></div>
                    {d.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`grid gap-6 select-none cursor-default ${userRole === 'staff' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        <GlassCard className="h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 shrink-0 bg-black/40 backdrop-blur-md rounded-t-2xl border-b border-white/5">
            <div>
              <CardTitle className="text-lg text-white">India Monitoring Points</CardTitle>
              <CardDescription className="text-purple-200/70">Real-time station status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="text-purple-400 bg-white/5 backdrop-blur hover:bg-white/10 hover:text-white border border-white/10">
              Expand Full Map <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <div className="absolute inset-0 top-[76px] z-0 opacity-80 mix-blend-screen">
            <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {stations.map(station => (
                <Marker key={station.id} position={station.coords as [number, number]} icon={createStatusIcon(station.breach)}>
                  <Popup className="rounded-xl"><p className="font-bold text-slate-900 m-0">{station.name}</p></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </GlassCard>

        {userRole === 'staff' && (
          <GlassCard className="flex flex-col h-[400px]">
            <CardHeader className="shrink-0 pb-4">
              <CardTitle className="text-lg text-white">Live Activity Feed</CardTitle>
              <CardDescription className="text-purple-200/70">Real-time laboratory operations log</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="relative border-l border-white/10 ml-3 space-y-6 pb-4 pt-2">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="relative pl-6">
                    <span className={`absolute -left-[13px] top-0 h-6 w-6 rounded-full border border-white/20 bg-black flex items-center justify-center ${log.color} shadow-[0_0_10px_currentColor]`}>
                      <Activity className="h-3 w-3" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-purple-100 leading-tight">{log.text}</span>
                      <span className="text-xs text-purple-200/50 mt-1">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Incident Modal */}
      {isIncidentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <GlassCard className="w-full max-w-lg p-6 border-rose-500/30 shadow-[0_0_50px_rgba(225,29,72,0.15)]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <AlertTriangle className="text-rose-500 mr-2 h-6 w-6 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" /> Incident Response
              </h2>
              <button onClick={() => setIsIncidentOpen(false)} className="text-purple-200/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-purple-200/70">Station</p>
                <p className="font-semibold text-white">Station #12 - Cauvery River Intake</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-950/30 rounded-lg p-4 border border-rose-500/20">
                  <p className="text-sm text-purple-200/70">Breach Parameter</p>
                  <p className="font-bold text-rose-400">E. coli: 14 CFU/100mL</p>
                  <p className="text-xs text-rose-500/70">Limit: 0 CFU</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-purple-200/70">Status</p>
                  <p className="font-bold text-white">Critical (18m ago)</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { addAuditLog('Incident Acknowledged by System Admin', 'check', 'text-emerald-400'); setIsIncidentOpen(false); setIsAlertAcknowledged(true); }} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50">Acknowledge Alert</Button>
              <Button onClick={() => { addAuditLog('Field Technician Dispatched', 'activity', 'text-blue-400'); setIsIncidentOpen(false); setIsAlertAcknowledged(true); }} variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white">Dispatch Field Technician</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Register Sample Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Register New Sample</h2>
              <button onClick={() => setIsRegisterOpen(false)} className="text-purple-200/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Client Name</label>
                <input required value={regForm.client} onChange={e => setRegForm({...regForm, client: e.target.value})} className="w-full rounded-lg border border-purple-500/40 bg-slate-900/80 text-white placeholder-slate-500 p-2.5 text-sm focus:ring-1 focus:ring-purple-400 focus:border-purple-400 outline-none" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Source Location</label>
                <input required value={regForm.source} onChange={e => setRegForm({...regForm, source: e.target.value})} className="w-full rounded-lg border border-purple-500/40 bg-slate-900/80 text-white placeholder-slate-500 p-2.5 text-sm focus:ring-1 focus:ring-purple-400 focus:border-purple-400 outline-none" placeholder="e.g. Yamuna Station" />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Sample Type</label>
                <select value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})} className="w-full rounded-lg border border-purple-500/40 bg-slate-900/80 text-white p-2.5 text-sm focus:ring-1 focus:ring-purple-400 focus:border-purple-400 outline-none [&>option]:bg-slate-900">
                  <option>Drinking Water</option>
                  <option>Surface Water</option>
                  <option>Groundwater</option>
                  <option>Industrial</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-500/50 mt-4">Submit Registration</Button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Log Results Modal */}
      {isLogResultsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Quick Log Results</h2>
              <button onClick={() => setIsLogResultsOpen(false)} className="text-purple-200/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-center py-6 text-purple-200/70">
              <Beaker className="w-12 h-12 mx-auto text-purple-400 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <p>For extensive data entry, please navigate to the full Lab Analysis view.</p>
              <Button onClick={() => navigate('/lab')} className="mt-6 bg-white/10 hover:bg-white/20 text-white border border-white/20">Go to Lab Analysis</Button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
