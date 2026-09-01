import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLabContext } from '../context/LabContext';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const createStatusIcon = (status: string) => {
  const color = status === 'Safe' ? '#10b981' : status === 'Warning' ? '#f59e0b' : '#ef4444';
  const isBreach = status === 'Breach';
  return L.divIcon({
    className: 'bg-transparent',
    html: `<div style="background-color: ${color}; width: 1.25rem; height: 1.25rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export const SourceMap = () => {
  const { stations, userRole } = useLabContext();
  
  const displayStations = userRole === 'staff'
    ? stations
    : stations.filter(s => s.name.includes('Delhi') || s.name.includes('Pune'));
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{userRole === 'staff' ? 'India Monitoring Network' : 'My Monitored Intakes'}</h1>
          <p className="text-purple-200/70 mt-1 text-sm">{userRole === 'staff' ? 'Real-time geospatial water quality stations' : 'Isolated view of Acme Corp facilities'}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div><span className="text-sm text-purple-100">Safe</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div><span className="text-sm text-purple-100">Warning</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#e11d48]"></div><span className="text-sm text-purple-100">Breach</span></div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-white relative z-0">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {displayStations.map(station => (
            <Marker key={station.id} position={station.coords as [number, number]} icon={createStatusIcon(station.status)}>
              <Popup className="rounded-xl min-w-[200px]">
                <div className="p-1 bg-white text-slate-900 rounded-lg -m-3 shadow-lg">
                  <h3 className="font-bold text-slate-900 border-b border-slate-200 p-3 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    {station.name}
                  </h3>
                  <div className="space-y-1 mb-3 p-3 pb-0">
                    <p className="text-xs text-slate-600">Status: 
                      <span className={`ml-1 font-bold ${station.status === 'Safe' ? 'text-emerald-600' : station.status === 'Breach' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {station.status}
                      </span>
                    </p>
                    {station.detail && <p className="text-xs font-semibold text-rose-600 mt-1">Alert: {station.detail}</p>}
                  </div>
                  {userRole === 'staff' && (
                    <div className="p-3 pt-0">
                      <button 
                        onClick={() => navigate('/lab')}
                        className="w-full bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 text-xs font-bold py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        Log Test for Station <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
