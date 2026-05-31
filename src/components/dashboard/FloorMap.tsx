import React, { useState } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/currency';
import { Monitor, Users, Settings, CircleDot, Info, Trash2, ShieldAlert } from 'lucide-react';
import { Desk } from '@/types';

function DeskElement({ desk, onClick, isSelected }: { desk: Desk; onClick: () => void; isSelected: boolean; key?: string }) {
  const getStatusStyle = (status: Desk['status'], isRoom: boolean) => {
    switch (status) {
      case 'available': return 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700/85 hover:text-zinc-400';
      case 'occupied': return 'bg-brand-500/10 border-brand-500/40 text-brand-500 shadow-[0_0_15px_rgba(255,10,22,0.04)]';
      case 'reserved': return 'bg-amber-500/10 border-amber-500/40 text-amber-500';
      case 'maintenance': return 'bg-purple-500/10 border-purple-500/40 text-purple-500';
    }
  };

  const isRoom = desk.type === 'meeting-room';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "absolute rounded-2xl border flex items-center justify-center cursor-pointer transition-all overflow-hidden",
        getStatusStyle(desk.status, isRoom),
        isSelected ? 'ring-2 ring-brand-500/80 border-brand-500 z-10 shadow-[0_0_20px_rgba(255,10,22,0.12)]' : ''
      )}
      style={{
        left: desk.x,
        top: desk.y,
        width: desk.width,
        height: desk.height,
        transform: `rotate(${desk.rotation || 0}deg)`
      }}
    >
      <div className="flex flex-col items-center justify-center p-2.5 text-center w-full h-full relative">
        {isRoom ? (
          <Users className="w-5 h-5 mb-1.5 opacity-60" />
        ) : (
          <Monitor className="w-4 h-4 mb-1.5 opacity-60" />
        )}
        <span className="text-[10px] font-bold font-mono tracking-wider truncate w-full">
          {desk.name}
        </span>
      </div>
      
      {desk.status === 'occupied' && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(255,10,22,0.8)] animate-pulse" />
      )}
      {desk.status === 'maintenance' && (
        <Settings className="absolute top-2 right-2 w-3 h-3 text-purple-500 animate-spin" style={{ animationDuration: '6s' }} />
      )}
    </motion.div>
  );
}

export function FloorMap() {
  const { branches, activeBranchId, bookDesk, reserveDesk, releaseDesk } = useStore();
  const activeBranch = branches.find(b => b.id === activeBranchId);
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  
  // Local Booking input form state
  const [occupantName, setOccupantName] = useState('');
  const [errorText, setErrorText] = useState('');

  if (!activeBranch) return null;

  const selectedDesk = activeBranch.desks.find(d => d.id === selectedDeskId);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occupantName.trim()) {
      setErrorText('Specify tenant identification');
      return;
    }
    if (!selectedDeskId) return;

    bookDesk(activeBranch.id, selectedDeskId, occupantName);
    setOccupantName('');
    setErrorText('');
  };

  const handleReserve = () => {
    if (!selectedDeskId) return;
    reserveDesk(activeBranch.id, selectedDeskId);
  };

  const handleRelease = () => {
    if (!selectedDeskId) return;
    releaseDesk(activeBranch.id, selectedDeskId);
    setOccupantName('');
    setErrorText('');
  };

  // Aggregates for dynamic summary bar
  const totalSpots = activeBranch.desks.length;
  const occupiedSpots = activeBranch.desks.filter(d => d.status === 'occupied').length;
  const reservedSpots = activeBranch.desks.filter(d => d.status === 'reserved').length;
  const maintenanceSpots = activeBranch.desks.filter(d => d.status === 'maintenance').length;
  const availableSpots = totalSpots - occupiedSpots - reservedSpots - maintenanceSpots;

  return (
    <div className="h-full flex flex-col min-h-0 space-y-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">Interactive Floor Map</h1>
          <p className="text-zinc-400 text-sm mt-1">{activeBranch.name} • live environment grid</p>
        </div>
        
        {/* Color Indicators Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-zinc-950 px-5 py-3 rounded-2xl border border-zinc-900 text-xs font-semibold text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-850 border border-zinc-800" />
            <span>Available ({availableSpots})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(255,10,22,0.4)]" />
            <span>Leased ({occupiedSpots})</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
             <span>Reserved ({reservedSpots})</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
             <span>Maintenance ({maintenanceSpots})</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Interactive map stage */}
        <div className="flex-1 glass-panel border-zinc-900 rounded-3xl relative overflow-auto bg-zinc-950/20">
          {/* Centered floor boundary board */}
          <div className="w-[1100px] h-[750px] relative p-10">
            {/* Grid dot indicator layout */}
            <div className="absolute inset-0 opacity-15" style={{ 
              backgroundImage: 'radial-gradient(#3f3f46 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }} />
            
            <AnimatePresence>
              {activeBranch.desks.map(desk => (
                <DeskElement 
                  key={desk.id} 
                  desk={desk} 
                  isSelected={selectedDeskId === desk.id}
                  onClick={() => {
                    setSelectedDeskId(desk.id);
                    setErrorText('');
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Space Info Drawer Panel */}
        <div className="w-full md:w-[360px] shrink-0 h-full flex flex-col">
          <AnimatePresence mode="wait">
            {selectedDesk ? (
              <motion.div 
                key={selectedDesk.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 glass-panel border-zinc-900 rounded-3xl overflow-hidden flex flex-col bg-zinc-950 shadow-2xl h-full"
              >
                {/* Drawer header */}
                <div className="p-6 border-b border-zinc-900 bg-zinc-900/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-display font-bold text-zinc-100">{selectedDesk.name}</h3>
                      <p className="text-xs text-zinc-500 capitalize">{selectedDesk.type.replace('-', ' ')} unit</p>
                    </div>
                    <button 
                      onClick={() => setSelectedDeskId(null)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      selectedDesk.status === 'available' ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' :
                      selectedDesk.status === 'occupied' ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400' :
                      selectedDesk.status === 'reserved' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                      'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                    )}>
                      {selectedDesk.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded">
                      ID: {selectedDesk.id.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Form and Controls Body */}
                <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Standard Rental Cost</span>
                    <p className="text-4xl font-display font-bold text-zinc-100">{formatINR(selectedDesk.pricePerMonth)}<span className="text-xs text-zinc-550 font-normal">/month</span></p>
                  </div>

                  {/* Operational Controls based on space status */}
                  <div className="space-y-4">
                    {selectedDesk.status === 'available' && (
                      <form onSubmit={handleBook} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CircleDot className="w-3.5 h-3.5 text-brand-500" /> Allocate to member
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Infospectrum Labs Pvt Ltd"
                            value={occupantName}
                            onChange={(e) => {
                              setOccupantName(e.target.value);
                              setErrorText('');
                            }}
                            className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl py-3 px-3.5 text-xs text-zinc-150 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/35 focus:border-brand-500 placeholder:text-zinc-600"
                          />
                          {errorText && (
                            <p className="text-[10px] text-brand-500 font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> {errorText}
                            </p>
                          )}
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-md hover:shadow-brand-500/25 cursor-pointer transform active:scale-95"
                        >
                          Book Unit Lease
                        </button>
                      </form>
                    )}

                    {selectedDesk.status === 'occupied' && (
                      <div className="space-y-4">
                        <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Active Lease Holder</span>
                          <p className="text-sm font-bold text-zinc-200">{selectedDesk.assigneeName || 'Anonymous Company'}</p>
                          <span className="text-[10px] text-zinc-500 mt-1 block">Contract active • Premium Tenant</span>
                        </div>

                        <button 
                          onClick={handleRelease}
                          className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-brand-500" /> Terminate Contract Lease
                        </button>
                      </div>
                    )}

                    {selectedDesk.status === 'reserved' && (
                      <div className="space-y-4">
                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Status Reserved</span>
                          <span className="text-xs text-zinc-400 mt-1 block">Held for a prospective member. Complete client booking profile below.</span>
                        </div>

                        <div className="space-y-2.5">
                          <input 
                            type="text" 
                            required
                            placeholder="Prospect tenant name"
                            value={occupantName}
                            onChange={(e) => setOccupantName(e.target.value)}
                            className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl py-3 px-3.5 text-xs text-zinc-150 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-zinc-650"
                          />
                          <button 
                            onClick={handleBook}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all cursor-pointer"
                          >
                            Release Reservation to Active Lease
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-900">
                    {selectedDesk.status === 'available' && (
                      <button 
                        onClick={handleReserve}
                        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reserve Workspace Spot
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 glass-panel border-zinc-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-zinc-600 bg-zinc-950/20">
                <Info className="w-8 h-8 opacity-35 mb-3 text-zinc-550" />
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Workspace Inspector</h4>
                <p className="text-[11px] text-zinc-550 max-w-xs mt-1 leading-normal">Select any workstation, suite, or virtual room on the interactive floor canvas map to inspect booking details, prices, occupancy stats, or trigger lease configurations.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
