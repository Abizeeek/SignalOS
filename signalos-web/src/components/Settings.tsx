import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  User, 
  ShieldAlert, 
  Volume2, 
  Zap, 
  Flame, 
  Coffee, 
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import type { Mode } from '../types';

export function Settings() {
  const { mode, setMode, user, refreshData } = useAppContext();
  const [userName, setUserName] = useState(user?.username || 'Guest');
  const [sessionLength, setSessionLength] = useState('25');
  const [noiseVolume, setNoiseVolume] = useState(30);
  const [alertThreshold, setAlertThreshold] = useState(3);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const triggerBackendSync = async () => {
    setIsSyncing(true);
    try {
      await refreshData();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const modesList = [
    { 
      id: 'FOUNDER' as Mode, 
      name: 'Founder Mode', 
      desc: 'Extremely aggressive focus parameters, prioritizing strategic tasks with high-leverage outcomes.',
      icon: Flame, 
      tone: 'text-rose-400 border-rose-500/20 bg-rose-500/5' 
    },
    { 
      id: 'MONK' as Mode, 
      name: 'Monk Mode', 
      desc: 'Isolation protocol. Focus tax penalties are maxed out. Zero tolerance for context switches.',
      icon: Coffee, 
      tone: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' 
    },
    { 
      id: 'OPERATOR' as Mode, 
      name: 'Operator Mode', 
      desc: 'Execution efficiency framework. Balanced weights across time slot optimization and task flow.',
      icon: Sliders, 
      tone: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 w-full max-w-[1100px] mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <SettingsIcon className="text-indigo-300" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
            <p className="text-slate-400 text-sm mt-1">Configure your focus environment and executive metrics profiles.</p>
          </div>
        </div>

        <button 
          onClick={triggerBackendSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? 'Syncing...' : 'Sync Database'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Mode Selection */}
          <section className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-lg font-medium text-slate-100 mb-5 flex items-center gap-2">
              <Zap className="text-indigo-400" size={18} />
              Executive Focus Profiles
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {modesList.map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    className={`text-left rounded-2xl border p-5 transition-all duration-300 relative flex gap-4 ${
                      isSelected 
                        ? 'border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.01]' 
                        : 'border-white/5 bg-slate-900/10 hover:bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${m.tone}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100 text-base">{m.name}</span>
                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-indigo-500 text-black flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* User Settings */}
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="text-lg font-medium text-slate-100 mb-5 flex items-center gap-2">
              <User className="text-indigo-400" size={18} />
              Account Credentials
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Username</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500/30 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">User ID (Access Token)</label>
                <input 
                  type="text" 
                  disabled
                  value={user?.id || 'default'}
                  className="w-full bg-slate-900/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed font-mono"
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl px-6 py-3 text-xs tracking-wider uppercase transition-colors"
                >
                  Save Profile Configuration
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Audio & Environmental Parameters */}
        <div className="space-y-6">
          
          {/* Ambient Settings */}
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="text-lg font-medium text-slate-100 mb-5 flex items-center gap-2">
              <Volume2 className="text-indigo-400" size={18} />
              Audio Environment
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                  <span>Binaural Ambient Volume</span>
                  <span>{noiseVolume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={noiseVolume}
                  onChange={(e) => setNoiseVolume(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Focus Session Length (Minutes)</label>
                <select 
                  value={sessionLength}
                  onChange={(e) => setSessionLength(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500/30 transition-all font-medium cursor-pointer"
                >
                  <option value="15">15 Minutes (Blitz)</option>
                  <option value="25">25 Minutes (Standard Pomo)</option>
                  <option value="50">50 Minutes (Deep Focus Strike)</option>
                  <option value="90">90 Minutes (Extreme Block)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Alert Protocol Settings */}
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="text-lg font-medium text-slate-100 mb-5 flex items-center gap-2">
              <ShieldAlert className="text-rose-400" size={18} />
              Distraction Guard Limits
            </h2>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                  <span>Distraction Alert Threshold</span>
                  <span>{alertThreshold} instances</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                If distractions exceed this threshold during an active session, Monk Mode triggers strict warning audio alerts.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Status Notification */}
      {isSaved && (
        <div className="fixed bottom-8 right-8 z-50 rounded-2xl bg-indigo-500 border border-indigo-400 text-black font-bold text-xs uppercase tracking-wider px-5 py-3 shadow-[0_10px_30px_rgba(99,102,241,0.3)] animate-in slide-in-from-bottom-5 duration-200 flex items-center gap-2">
          <Check size={14} strokeWidth={3} />
          Protocol Configurations Saved
        </div>
      )}
    </div>
  );
}
