import { useEffect, useState } from "react";
import { useWarMode } from "../hooks/useWarMode";
import { useAppContext } from "../context/AppContext";
import { 
  Zap, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Trophy, 
  Target,
  Bell,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FocusWar() {
  const { user } = useAppContext();
  const {
    session,
    rank,
    startWar,
    logDistraction,
    completeFocusBlock,
    endWar,
    fetchRank,
    loadActiveSession
  } = useWarMode(user?.id || "default");

  const [lastHP, setLastHP] = useState(100);
  const [showDamage, setShowDamage] = useState(false);

  useEffect(() => {
    console.log("FocusWar mounted, loading rank and session for user:", user?.id);
    fetchRank();
    loadActiveSession();
  }, [fetchRank, loadActiveSession, user?.id]);

  useEffect(() => {
    if (session && session.focusHP < lastHP) {
      setShowDamage(true);
      const timer = setTimeout(() => setShowDamage(false), 1000);
      setLastHP(session.focusHP);
      return () => clearTimeout(timer);
    }
    if (session) setLastHP(session.focusHP);
  }, [session, lastHP]);

  const hpColor =
    session && session.focusHP > 50
      ? "from-emerald-500 to-teal-600"
      : session && session.focusHP > 20
      ? "from-amber-500 to-orange-600"
      : "from-red-500 to-rose-700";

  const getRankBadgeColor = (r: string) => {
    if (r.includes("Visionary")) return "text-purple-400 border-purple-500/30 bg-purple-500/10";
    if (r.includes("CEO")) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    if (r.includes("Manager")) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    return "text-slate-400 border-slate-500/30 bg-slate-500/10";
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1200px] mx-auto custom-scrollbar h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Zap className="text-indigo-400" /> Focus War Room
          </h1>
          <p className="text-slate-400 font-medium">Neutralize distractions. Ascend your rank.</p>
        </div>
        
        {rank && (
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold tracking-wider text-xs uppercase shadow-[0_0_15px_rgba(0,0,0,0.3)] ${getRankBadgeColor(rank)}`}>
            {rank}
          </div>
        )}
      </div>

      {!session ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 mt-12 bg-indigo-500/5 border-indigo-500/20"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Zap size={48} className="text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Initialize Combat Protocol</h2>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
              Every distraction is an enemy attack on your productivity. Every focus block is a battle won. 
              Combat logic scales HP and XP based on real-time focus integrity.
            </p>
          </div>
          <button
            onClick={startWar}
            className="group relative mt-4 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
               DELEGATE WAR SESSION <Zap size={18} fill="currentColor" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Battle HUD */}
            <div className="glass-panel p-8 relative overflow-hidden bg-slate-900/40 border-white/5">
              <div className="absolute top-0 right-0 p-4">
                 <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Session ID: {session.id.substring(0, 8)}</div>
              </div>

              {/* Status Banner */}
              <AnimatePresence>
                {session.bossLevel !== 'NONE' && session.warStatus === 'ONGOING' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`mb-8 p-4 rounded-xl border flex items-center gap-4 ${
                      session.bossLevel === 'FINAL_BOSS' 
                        ? 'bg-red-500/20 border-red-500/40 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center animate-bounce">
                      {session.bossLevel === 'FINAL_BOSS' ? <AlertTriangle className="text-red-400" /> : <ShieldAlert className="text-amber-400" />}
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-widest text-xs">Boss Alert Triggered</div>
                      <div className="text-sm font-medium">
                        {session.bossLevel === 'FINAL_BOSS' 
                          ? "CRITICAL INTEL: Final Boss detected. Multiple decoys failed. FOCUS OR PERISH." 
                          : "MINI BOSS ENGAGED: Distraction threshold breached. Holding focus is primary objective."}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HP Bar */}
              <div className="mb-10 relative">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="text-rose-500" fill="currentColor" />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Integrity HP</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{session.focusHP}</span>
                    <span className="text-slate-500 text-sm font-bold">/100</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <motion.div 
                    className={`h-full rounded-full bg-gradient-to-r ${hpColor} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${session.focusHP}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                  />
                </div>
                {showDamage && (
                  <motion.div 
                    initial={{ opacity: 1, scale: 0.5, y: 0 }}
                    animate={{ opacity: 0, scale: 1.5, y: -50 }}
                    className="absolute right-0 top-0 text-red-500 text-6xl font-black italic pointer-events-none drop-shadow-lg"
                  >
                    -10 HP
                  </motion.div>
                )}
              </div>

              {/* XP Bar */}
              <div className="relative">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="text-indigo-400" fill="currentColor" />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Vision XP</span>
                  </div>
                  <div className="text-indigo-300 font-bold uppercase tracking-widest text-xs">
                    Level Progress
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-500"
                    animate={{ width: `${(session.xpEarned % 500) / 5}%` }}
                  />
                </div>
                <div className="mt-2 text-right">
                   <span className="text-2xl font-black text-indigo-400 tracking-tighter">{session.xpEarned} <span className="text-[10px] text-slate-500 uppercase tracking-normal">Total XP</span></span>
                </div>
              </div>
            </div>

            {/* Controls */}
            {session.warStatus === 'ONGOING' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={logDistraction}
                  className="glass-panel p-6 flex flex-col items-center gap-3 bg-red-500/5 hover:bg-red-500/10 border-red-500/20 group transition-all cursor-pointer"
                >
                  <ShieldAlert className="text-red-500 group-hover:scale-110 transition-transform" size={32} />
                  <div className="text-center">
                    <span className="block font-bold text-red-200">LOG DISTRACTION</span>
                    <span className="text-[10px] text-red-500/60 font-black uppercase">-10 INTEGRITY HP</span>
                  </div>
                </button>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => completeFocusBlock(25)}
                    className="w-full glass-panel p-4 flex items-center justify-center gap-3 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 group transition-all cursor-pointer"
                  >
                    <Target className="text-emerald-500" size={20} />
                    <span className="font-bold text-emerald-200 uppercase tracking-widest text-xs">25M BLITZ (+50 XP)</span>
                  </button>
                  <button 
                    onClick={() => completeFocusBlock(50)}
                    className="w-full glass-panel p-4 flex items-center justify-center gap-3 bg-indigo-500/5 hover:bg-indigo-400/10 border-indigo-500/20 group transition-all cursor-pointer"
                  >
                    <Target className="text-indigo-400" size={20} />
                    <span className="font-bold text-indigo-200 uppercase tracking-widest text-xs">50M DEEP STRIKE (+100 XP)</span>
                  </button>
                </div>
              </div>
            ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-1 flex flex-col items-center rounded-3xl ${
                    session.warStatus === 'VICTORY' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}
                >
                   <div className={`w-full p-8 rounded-3xl border text-center flex flex-col items-center gap-4 ${
                      session.warStatus === 'VICTORY' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' 
                        : 'bg-red-500/10 border-red-500/30 text-red-100'
                   }`}>
                      {session.warStatus === 'VICTORY' ? (
                        <>
                          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-2">
                             <Trophy size={40} className="text-emerald-400" />
                          </div>
                          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Victory Secured</h2>
                          <p className="text-emerald-200/60 max-w-sm text-sm">Target focus thresholds achieved. Your vision remains uncompromised.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-2">
                             <AlertTriangle size={40} className="text-red-400" />
                          </div>
                          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Defeat Inevitable</h2>
                          <p className="text-red-200/60 max-w-sm text-sm">System integrity bypassed by distraction vectors. Mission failure.</p>
                        </>
                      )}
                      
                      <div className="grid grid-cols-3 w-full gap-4 mt-4">
                         <div className="glass-panel p-4 bg-white/5 border-white/10">
                            <div className="text-[10px] uppercase text-white/40 mb-1">XP Gained</div>
                            <div className="text-xl font-bold">{session.xpEarned}</div>
                         </div>
                         <div className="glass-panel p-4 bg-white/5 border-white/10">
                            <div className="text-[10px] uppercase text-white/40 mb-1">Distractions</div>
                            <div className="text-xl font-bold">{session.distractionCount}</div>
                         </div>
                         <div className="glass-panel p-4 bg-white/5 border-white/10">
                            <div className="text-[10px] uppercase text-white/40 mb-1">Status</div>
                            <div className="text-xl font-bold">{session.warStatus}</div>
                         </div>
                      </div>

                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity"
                      >
                        Return to Hub
                      </button>
                   </div>
                </motion.div>
            )}
          </div>

          {/* Side stats */}
          <div className="space-y-6">
            <div className="glass-panel p-6 border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Battle Log</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Distractions</span>
                   <span className="font-mono text-white">{session.distractionCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Boss Encounters</span>
                   <span className="font-mono text-white">{session.bossLevel === 'NONE' ? 0 : session.bossLevel === 'MINI_BOSS' ? 1 : 2}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Combat Time</span>
                   <span className="font-mono text-white">Active</span>
                </div>
              </div>
            </div>

            {session.warStatus === 'ONGOING' && (
              <button 
                onClick={endWar}
                className="w-full py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                Terminate Mission
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
