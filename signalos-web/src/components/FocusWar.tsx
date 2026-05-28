import { useEffect, useState, useMemo } from "react";
import { useWarMode } from "../hooks/useWarMode";
import { useAppContext } from "../context/AppContext";
import { 
  Zap, 
  ShieldAlert, 
  Trophy, 
  Target, 
  AlertTriangle,
  Flame, 
  Shield, 
  Award, 
  Activity, 
  Lock, 
  Unlock, 
  X, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  desc: string;
  lore: string;
  icon: React.ComponentType<any>;
  tier: "bronze" | "silver" | "gold" | "platinum";
  progress: { current: number; target: number };
  unlocked: boolean;
  booster: string;
}

export function FocusWar() {
  const { user } = useAppContext();
  const {
    session,
    rank,
    history,
    startWar,
    logDistraction,
    completeFocusBlock,
    endWar,
    fetchRank,
    loadActiveSession
  } = useWarMode(user?.id || "default");

  const [lastHP, setLastHP] = useState(100);
  const [showDamage, setShowDamage] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [xpGainedText, setXpGainedText] = useState("");
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [battleLogs, setBattleLogs] = useState<{ id: string; time: string; msg: string; type: "info" | "warning" | "success" }[]>([]);

  useEffect(() => {
    fetchRank();
    loadActiveSession();
  }, [fetchRank, loadActiveSession, user?.id]);

  // Compute Daily Streak
  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;
    
    // Extract unique dates of sessions (victory or any XP earned)
    const activeDates = Array.from(
      new Set(
        history
          .filter(s => s.warStatus === "VICTORY" || s.xpEarned > 0)
          .map(s => s.sessionDate)
      )
    );
    if (activeDates.length === 0) return 0;

    // Sort dates descending
    activeDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // If newest session is older than yesterday, streak is broken
    if (activeDates[0] !== todayStr && activeDates[0] !== yesterdayStr) {
      return 0;
    }

    let currentStreak = 0;
    const checkDate = new Date(activeDates[0]);

    for (let i = 0; i < 30; i++) {
      const expectedStr = checkDate.toISOString().split("T")[0];
      if (activeDates.includes(expectedStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }, [history]);

  // Dynamic Telemetry Logger
  const addLog = (msg: string, type: "info" | "warning" | "success" = "info") => {
    const time = new Date().toTimeString().split(" ")[0];
    setBattleLogs(prev => [{ id: `log-${Date.now()}-${Math.random()}`, time, msg, type }, ...prev].slice(0, 30));
  };

  // Initial logs setup
  useEffect(() => {
    if (session) {
      setBattleLogs([]);
      addLog("Tactical interface online. Shield integrity 100%.", "info");
      if (session.distractionCount > 0) {
        addLog(`Distraction vectors detected: ${session.distractionCount}`, "warning");
      }
    }
  }, [session?.id]);

  // Track Damage Screen Shakes and Logs
  useEffect(() => {
    if (!session) return;

    if (session.focusHP < lastHP) {
      setShowDamage(true);
      const timer = setTimeout(() => setShowDamage(false), 800);
      addLog(`Shield breach detected! Lost ${lastHP - session.focusHP} HP. Integrity at ${session.focusHP}%.`, "warning");
      setLastHP(session.focusHP);
      return () => clearTimeout(timer);
    }
    setLastHP(session.focusHP);
  }, [session?.focusHP, lastHP]);

  // Track XP Milestones & Floating Text
  useEffect(() => {
    if (!session) return;

    if (session.xpEarned > lastXP) {
      const diff = session.xpEarned - lastXP;
      setXpGainedText(`+${diff} XP`);
      setShowXpFloat(true);
      const timer = setTimeout(() => setShowXpFloat(false), 1200);
      addLog(`Focus block achieved! Absorbed +${diff} Vision XP.`, "success");
      setLastXP(session.xpEarned);
      return () => clearTimeout(timer);
    }
    setLastXP(session.xpEarned);
  }, [session?.xpEarned, lastXP]);

  // Track Boss Level Changes
  useEffect(() => {
    if (!session) return;
    if (session.bossLevel === "MINI_BOSS") {
      addLog("ALERT: Mini Boss engaged. Target threshold compromised. Focus multiplier degraded.", "warning");
    } else if (session.bossLevel === "FINAL_BOSS") {
      addLog("CRITICAL SIREN: Final Boss breach. Cognitive shielding failing. Extreme vigilance required.", "warning");
    }
  }, [session?.bossLevel]);

  // Calculate Achievements Cabinet
  const achievements = useMemo<Achievement[]>(() => {
    const totalXP = history.reduce((acc, s) => acc + s.xpEarned, 0);
    const flawlessVictories = history.filter(s => s.warStatus === "VICTORY" && s.distractionCount === 0).length;
    const bossVictories = history.filter(s => s.warStatus === "VICTORY" && s.bossLevel === "FINAL_BOSS").length;
    const completedBlocksCount = history.reduce((acc, s) => acc + Math.floor(s.xpEarned / 50), 0);

    return [
      {
        id: "ach-1",
        title: "Distraction Slayer",
        desc: "Secure a perfect focus victory with zero distraction interruptions.",
        lore: "Steel mind. You completely locked out secondary decoy impulses.",
        icon: Shield,
        tier: "gold",
        progress: { current: flawlessVictories, target: 1 },
        unlocked: flawlessVictories >= 1,
        booster: "+15% Base Focus multiplier"
      },
      {
        id: "ach-2",
        title: "Visionary Lord",
        desc: "Ascend to rank of Visionary by accumulating 5000+ war experience.",
        lore: "Supreme focus warlord. Signal flow is an extension of your thought.",
        icon: Trophy,
        tier: "platinum",
        progress: { current: totalXP, target: 5000 },
        unlocked: totalXP >= 5000,
        booster: "+30% Brain fuel efficiency"
      },
      {
        id: "ach-3",
        title: "Siren Conqueror",
        desc: "Vanquish the Final Boss by winning a session under red alert.",
        lore: "Legendary resilience. You survived critical distraction breaches.",
        icon: Flame,
        tier: "gold",
        progress: { current: bossVictories, target: 1 },
        unlocked: bossVictories >= 1,
        booster: "Shield restoration speed +20%"
      },
      {
        id: "ach-4",
        title: "Combat Veteran",
        desc: "Deploy into 5 focus war sessions.",
        lore: "Habits are forged in fire. Multiple battle scars on your profile.",
        icon: Target,
        tier: "silver",
        progress: { current: history.length, target: 5 },
        unlocked: history.length >= 5,
        booster: "+10% Shield battery max capacity"
      },
      {
        id: "ach-5",
        title: "Streak Igniter",
        desc: "Maintain a daily focus streak of 3+ consecutive days.",
        lore: "Unbroken rhythm. The fire burns brighter with absolute routine.",
        icon: Zap,
        tier: "silver",
        progress: { current: streak, target: 3 },
        unlocked: streak >= 3,
        booster: "Double daily streak XP rewards"
      },
      {
        id: "ach-6",
        title: "Blitzkrieg Squire",
        desc: "Earn 250 focus XP by deploying Blitz and Deep Strike focus blocks.",
        lore: "Fast execution cycles. You turn goals into ashes instantly.",
        icon: Award,
        tier: "bronze",
        progress: { current: totalXP, target: 250 },
        unlocked: totalXP >= 250,
        booster: "Unlock custom cyber hud decals"
      },
      {
        id: "ach-7",
        title: "Deep Strike Master",
        desc: "Successfully log a 50m Deep Strike focus session.",
        lore: "Subterranean cognitive diving. Immersive construction at its finest.",
        icon: ShieldAlert,
        tier: "gold",
        progress: { current: completedBlocksCount, target: 1 },
        unlocked: completedBlocksCount >= 1,
        booster: "+15% Attention residue buffer limit"
      },
      {
        id: "ach-8",
        title: "Monk Sage",
        desc: "Unlock absolute transcendence by securing a 5-day streak or 3000+ total XP.",
        lore: "Transcendence achieved. Zero noise interference in your proximity.",
        icon: Activity,
        tier: "platinum",
        progress: { current: Math.max(streak, Math.round((totalXP/3000)*5)), target: 5 },
        unlocked: streak >= 5 || totalXP >= 3000,
        booster: "+25% Decision fatigue regeneration rate"
      }
    ];
  }, [history, streak]);

  const unlockedCount = useMemo(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const hpColor =
    session && session.focusHP > 50
      ? "from-cyan-400 to-teal-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] border-cyan-400/30 text-cyan-200"
      : session && session.focusHP > 20
      ? "from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400/30 text-amber-200"
      : "from-rose-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] border-rose-500/40 text-rose-200";

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "text-indigo-400 border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_10px_rgba(99,102,241,0.1)]";
      case "gold": return "text-amber-400 border-amber-500/30 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
      case "silver": return "text-slate-300 border-white/10 bg-white/5 shadow-sm";
      default: return "text-orange-300 border-orange-500/20 bg-orange-500/5";
    }
  };

  const getRankBadgeColor = (r: string) => {
    if (r.includes("Visionary")) return "text-purple-400 border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    if (r.includes("CEO")) return "text-indigo-400 border-indigo-500/40 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]";
    if (r.includes("Manager")) return "text-blue-400 border-blue-500/40 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
    return "text-slate-400 border-slate-500/30 bg-slate-500/10";
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1300px] mx-auto custom-scrollbar h-full flex flex-col gap-6 relative">
      
      {/* COCKPIT STATS OVERLAY / HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 border border-white/5 backdrop-blur-md p-5 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
              <Zap className="text-indigo-400" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white uppercase flex items-center gap-2">
                Focus War Room <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-300 font-mono tracking-widest animate-pulse">V2.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Neutralize distraction vectors. Forge cognitive shielding capacity.</p>
            </div>
          </div>
        </div>

        {/* GAMIFIED STAT BLOCKS */}
        <div className="flex items-center flex-wrap gap-3 relative z-10 w-full md:w-auto">
          {/* Daily Streak Indicator */}
          <div 
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all cursor-help group relative"
            title="Maintain streak by finishing Focus sessions daily!"
          >
            <div className="relative">
              <Flame className="text-orange-400 fill-orange-500/40 animate-bounce" size={18} />
              <div className="absolute inset-0 bg-orange-500 blur-md opacity-30 animate-pulse rounded-full" />
            </div>
            <span className="text-xs font-black tracking-wider text-orange-200 font-mono">{streak} Day Streak</span>
            
            {/* Tooltip detail */}
            <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-xl border border-orange-500/20 bg-slate-950/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-2xl">
              <div className="text-[10px] font-black uppercase text-orange-400 tracking-wider mb-1 flex items-center gap-1">
                <Flame size={10} />
                Daily Streak Burner
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Finish at least 1 Focus Block or win a Focus War session daily to stack focus multipliers!
              </p>
            </div>
          </div>

          {/* Trophy Cabinet Toggle */}
          <button 
            onClick={() => setIsAchievementsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all cursor-pointer font-bold font-mono text-xs text-amber-200"
          >
            <Trophy className="text-amber-400 fill-amber-500/30" size={16} />
            <span>Trophies {unlockedCount}/8</span>
            <ChevronRight size={14} className="text-amber-400/70" />
          </button>

          {/* Rank Badge */}
          {rank && (
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 font-bold tracking-wider text-xs uppercase ${getRankBadgeColor(rank)}`}>
              <span>{rank}</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTION SCENE CONTAINER */}
      {!session ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 mt-6 bg-indigo-500/5 border-indigo-500/15 shadow-[0_0_30px_rgba(99,102,241,0.05)] rounded-3xl"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
            <Zap size={44} className="text-indigo-400 animate-pulse" />
            <div className="absolute inset-0 bg-indigo-400 blur-2xl opacity-20 animate-pulse rounded-full" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-3">Initialize Combat Protocol</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Activate the tactical HUD to shield yourself from distractions. Focus blocks feed your XP, while tab-switching lost-focus alerts trigger damage penalties. Keep the core shields online.
            </p>
          </div>
          <button
            onClick={startWar}
            className="group relative mt-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-black font-black rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] cursor-pointer overflow-hidden border border-indigo-400/40 text-sm tracking-widest uppercase"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-slate-100">
               LAUNCH WAR SESSION <Zap size={18} fill="currentColor" className="text-indigo-200 animate-pulse" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* LEFT BATTLE HUDS (2 COLS) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* MAIN GAMING CONSOLE WITH SHAKE EFFECT */}
            <motion.div 
              animate={showDamage ? { x: [0, -12, 12, -12, 12, 0], y: [0, 8, -8, 8, -8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 relative overflow-hidden bg-slate-900/40 border-white/5 rounded-3xl shadow-2xl"
            >
              {/* Telemetry LED lines */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500/20 via-cyan-500 to-indigo-500/20" />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold bg-black/40 border border-white/5 px-2.5 py-1 rounded-md">
                 <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                 WAR ID: {session.id.substring(0, 8)}
              </div>

              {/* TACTICAL ALERT BANNER */}
              <AnimatePresence>
                {session.bossLevel !== "NONE" && session.warStatus === "ONGOING" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, scale: 0.95 }}
                    animate={{ height: "auto", opacity: 1, scale: 1 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95 }}
                    className={`mb-6 p-4.5 rounded-2xl border flex items-center gap-4 relative overflow-hidden ${
                      session.bossLevel === "FINAL_BOSS" 
                        ? "bg-red-500/20 border-red-500/40 text-red-100 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]" 
                        : "bg-amber-500/20 border-amber-500/40 text-amber-100 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]"
                    }`}
                  >
                    {/* Pulsing Alert Light */}
                    <div className={`absolute top-0 right-0 w-12 h-12 blur-2xl opacity-40 animate-pulse rounded-full ${
                      session.bossLevel === "FINAL_BOSS" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    
                    <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center flex-shrink-0 animate-bounce">
                      {session.bossLevel === "FINAL_BOSS" ? (
                        <AlertTriangle className="text-red-400 animate-pulse" size={22} />
                      ) : (
                        <ShieldAlert className="text-amber-400" size={22} />
                      )}
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-widest text-[10px] text-slate-300">
                        {session.bossLevel === "FINAL_BOSS" ? "SYSTEM CORE UNDER SEVERE SIEGE" : "TACTICAL ALERT: BREACH ACTIVE"}
                      </div>
                      <div className="text-xs font-bold mt-0.5 leading-normal">
                        {session.bossLevel === "FINAL_BOSS" 
                          ? "CRITICAL SIREN: Distraction overflow triggers final boss algorithms! Keep focus active to prevent system failure!" 
                          : "MINI BOSS ACTIVE: You exceeded distraction bounds. Stand fast and absorb focus blocks to recover!"}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* COCKPIT DIALS AND HEALTH BARS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Circular shield gauge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center relative">
                  <div className="w-40 h-40 relative flex items-center justify-center">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="68" 
                        className="stroke-slate-800" 
                        strokeWidth="10" 
                        fill="transparent" 
                      />
                      <motion.circle 
                        cx="80" 
                        cy="80" 
                        r="68" 
                        className={`stroke-current bg-gradient-to-r ${hpColor.includes("cyan") ? "text-cyan-400" : hpColor.includes("amber") ? "text-amber-500" : "text-rose-500"}`}
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 * (1 - session.focusHP / 100)}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">SHIELD HP</span>
                      <span className="text-4xl font-black text-white tracking-tighter mt-0.5">{session.focusHP}%</span>
                    </div>
                  </div>
                  
                  {/* Floating Damage alert */}
                  <AnimatePresence>
                    {showDamage && (
                      <motion.div 
                        initial={{ opacity: 1, scale: 0.7, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, y: -60 }}
                        exit={{ opacity: 0 }}
                        className="absolute text-red-500 text-5xl font-black italic pointer-events-none drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20"
                      >
                        -10 HP
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Linear progress and rank XP details */}
                <div className="md:col-span-8 space-y-6">
                  {/* XP Progression Details */}
                  <div className="relative">
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className="text-indigo-400 fill-indigo-500/20" size={16} />
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">VISION EXPERIENCE POINTS</span>
                      </div>
                      <span className="font-mono text-xs text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                        Lvl {Math.floor(session.xpEarned / 500) + 1}
                      </span>
                    </div>
                    
                    <div className="h-4 w-full bg-slate-950/70 rounded-full overflow-hidden border border-white/5 p-1 relative">
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(session.xpEarned % 500) / 5}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                      <span>{(session.xpEarned % 500)} / 500 XP</span>
                      <span>Total Earned: <strong className="text-slate-300 font-black">{session.xpEarned} XP</strong></span>
                    </div>

                    {/* Floating XP Gain alert */}
                    <AnimatePresence>
                      {showXpFloat && (
                        <motion.div 
                          initial={{ opacity: 1, scale: 0.7, y: 0 }}
                          animate={{ opacity: 0, scale: 1.5, y: -50 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-0 top-0 text-indigo-400 text-4xl font-black italic pointer-events-none drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] z-20"
                        >
                          {xpGainedText}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Energy matrix / sub statistics bars */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-3 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Breaches Logged</span>
                      <span className="font-mono text-sm font-bold text-rose-400">{session.distractionCount}</span>
                    </div>
                    <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-3 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Block Restores</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {Math.floor(session.xpEarned / 50)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* ACTION STATIONS & WEAPONS BAR */}
            {session.warStatus === "ONGOING" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* LOG DISTRACTION BUTTON */}
                <button 
                  onClick={logDistraction}
                  className="glass-panel p-5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40 group flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="text-rose-500 fill-rose-500/10" size={24} />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-rose-200 tracking-wider text-xs uppercase">Breach Distraction</span>
                    <span className="text-[9px] text-rose-500 font-black font-mono tracking-widest mt-0.5 block">-10 SHIELD HP</span>
                  </div>
                </button>

                {/* 25M BLITZ BUTTON */}
                <button 
                  onClick={() => completeFocusBlock(25)}
                  className="glass-panel p-5 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 group flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Target className="text-emerald-500" size={24} />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-emerald-200 tracking-wider text-xs uppercase">25M Blitz Strike</span>
                    <span className="text-[9px] text-emerald-400 font-black font-mono tracking-widest mt-0.5 block">+50 XP | +5 HP</span>
                  </div>
                </button>

                {/* 50M DEEP STRIKE BUTTON */}
                <button 
                  onClick={() => completeFocusBlock(50)}
                  className="glass-panel p-5 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 group flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-indigo-200 tracking-wider text-xs uppercase">50M Deep Strike</span>
                    <span className="text-[9px] text-indigo-400 font-black font-mono tracking-widest mt-0.5 block">+100 XP | +10 HP</span>
                  </div>
                </button>

              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-1 flex flex-col items-center rounded-3xl ${
                  session.warStatus === "VICTORY" ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}
              >
                 <div className={`w-full p-8 rounded-3xl border text-center flex flex-col items-center gap-4 ${
                    session.warStatus === "VICTORY" 
                      ? "bg-slate-950/90 border-emerald-500/30 text-emerald-100" 
                      : "bg-slate-950/90 border-red-500/30 text-red-100"
                 }`}>
                    {session.warStatus === "VICTORY" ? (
                      <>
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                           <Trophy size={40} className="text-emerald-400 animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black tracking-widest uppercase italic bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Combat Victory</h2>
                        <p className="text-emerald-200/60 max-w-sm text-xs leading-relaxed">
                          Shield shields maintained. The distraction vectors were neutralized. XP and streaks loaded to database records.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                           <AlertTriangle size={40} className="text-rose-400 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black tracking-widest uppercase italic bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">System Compromised</h2>
                        <p className="text-rose-200/60 max-w-sm text-xs leading-relaxed">
                          Shield integrity depleted. The distraction decoy triggers bypassed the core database shield. Mission failure.
                        </p>
                      </>
                    )}
                    
                    <div className="grid grid-cols-3 w-full gap-4 mt-4 max-w-md">
                       <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">XP Gained</div>
                          <div className="text-xl font-bold font-mono text-indigo-400">+{session.xpEarned}</div>
                       </div>
                       <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Distractions</div>
                          <div className="text-xl font-bold font-mono text-rose-400">{session.distractionCount}</div>
                       </div>
                       <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl">
                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Final Shield</div>
                          <div className="text-xl font-bold font-mono text-cyan-400">{session.focusHP}%</div>
                       </div>
                    </div>

                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-xs uppercase tracking-widest font-black transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} className="animate-spin-slow" />
                      Return to Command Hub
                    </button>
                 </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT PANELS (1 COL) */}
          <div className="space-y-6">
            
            {/* MINI ACHIEVEMENT PREVIEW CABINET */}
            <div className="glass-panel p-6 border-white/5 rounded-3xl relative overflow-hidden flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Trophy className="text-amber-400" size={14} />
                  Trophy Progress
                </h3>
                <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {unlockedCount}/8
                </span>
              </div>

              {/* Achievements Mini Matrix (showing 3 premium ones) */}
              <div className="space-y-3">
                {achievements.slice(0, 3).map(a => {
                  const Icon = a.icon;
                  return (
                    <div 
                      key={a.id} 
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                        a.unlocked 
                          ? "border-emerald-500/20 bg-emerald-500/5 shadow-sm" 
                          : "border-slate-800 bg-slate-950/20 opacity-60"
                      }`}
                    >
                      <div className={`h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                        a.unlocked ? "border-emerald-400/30 bg-emerald-500/10" : "border-slate-700 bg-slate-900"
                      }`}>
                        {a.unlocked ? <Icon className="text-emerald-400" size={16} /> : <Lock className="text-slate-600" size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                          <span className="truncate">{a.title}</span>
                          {a.unlocked && <span className="text-[8px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-mono font-bold">UNLOCKED</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{a.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setIsAchievementsOpen(true)}
                className="w-full py-2.5 text-center border border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-indigo-300 transition-all cursor-pointer"
              >
                Expand Trophy Cabinet
              </button>
            </div>

            {/* REAL-TIME TELEMETRY LOGS */}
            <div className="glass-panel p-6 border-white/5 rounded-3xl flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Terminal className="text-cyan-400 animate-pulse" size={14} />
                Telemetry Combat Log
              </h3>
              
              <div className="space-y-3 font-mono text-[10px] h-[190px] overflow-y-auto pr-1 custom-scrollbar leading-relaxed">
                {battleLogs.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-12">
                    Waiting for tactical focus telemetry initialization...
                  </div>
                ) : (
                  battleLogs.map(l => (
                    <div key={l.id} className="flex gap-2 items-start border-b border-white/[0.02] pb-1.5">
                      <span className="text-indigo-400 font-bold flex-shrink-0">[{l.time}]</span>
                      <span className={
                        l.type === "warning" ? "text-rose-300" : l.type === "success" ? "text-emerald-300" : "text-slate-300"
                      }>
                        {l.msg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TERMINATE MISSION BUTTON */}
            {session.warStatus === "ONGOING" && (
              <button 
                onClick={endWar}
                className="w-full py-4 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 rounded-3xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-rose-950/20"
              >
                Terminate Focus Protocol
              </button>
            )}

          </div>

        </div>
      )}

      {/* DETAILED LEETCODE TROPHIES & ACHIEVEMENTS DRAWER OVERLAY */}
      <AnimatePresence>
        {isAchievementsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
            {/* Click to close area */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsAchievementsOpen(false)} />
            
            <motion.div 
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="w-full max-w-lg bg-slate-900 border-l border-white/10 h-full relative shadow-2xl flex flex-col p-6 overflow-hidden z-10"
            >
              {/* Telemetry border decals */}
              <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-indigo-500/30 via-amber-500 to-indigo-500/30" />

              {/* Close & Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="text-amber-400 fill-amber-500/10 animate-bounce" size={22} />
                  <div>
                    <h2 className="text-lg font-black tracking-wider text-white uppercase">Trophy Cabinet</h2>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">LeetCode & Snapchat Milestones</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAchievementsOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Stat Overview */}
              <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-5 mb-6 grid grid-cols-2 gap-4 font-mono">
                <div className="text-center border-r border-white/5">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Milestones Unlocked</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{unlockedCount} / 8</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Cabinet Synergy</div>
                  <div className="text-2xl font-black text-indigo-400 mt-1">{Math.round((unlockedCount / 8) * 100)}%</div>
                </div>
              </div>

              {/* Achievements scrollable container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {achievements.map(a => {
                  const Icon = a.icon;
                  const percent = Math.min(100, Math.round((a.progress.current / a.progress.target) * 100));
                  
                  return (
                    <div 
                      key={a.id}
                      className={`p-5 rounded-3xl border flex flex-col gap-4 relative overflow-hidden transition-all ${
                        a.unlocked 
                          ? `${getTierColor(a.tier)} shadow-lg` 
                          : "border-slate-800 bg-slate-950/15 opacity-60 hover:opacity-85 transition-opacity"
                      }`}
                    >
                      {/* Badge Ribbon */}
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <span className={`text-[8px] uppercase font-mono font-black border px-2 py-0.5 rounded-full ${
                          a.tier === "platinum" 
                            ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                            : a.tier === "gold"
                            ? "border-amber-400/40 bg-amber-500/10 text-amber-300"
                            : a.tier === "silver"
                            ? "border-slate-600 bg-slate-700/15 text-slate-300"
                            : "border-orange-500/40 bg-orange-500/10 text-orange-300"
                        }`}>
                          {a.tier}
                        </span>
                        
                        {a.unlocked ? (
                          <Unlock size={12} className="text-emerald-400" />
                        ) : (
                          <Lock size={12} className="text-slate-500" />
                        )}
                      </div>

                      {/* Header row */}
                      <div className="flex items-center gap-3.5">
                        <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
                          a.unlocked 
                            ? `${a.tier === "platinum" ? "border-indigo-400/30 bg-indigo-500/15" : a.tier === "gold" ? "border-amber-400/30 bg-amber-500/15" : "border-white/10 bg-slate-900"}`
                            : "border-slate-800 bg-slate-950 text-slate-700"
                        }`}>
                          <Icon size={20} className={a.unlocked ? "animate-pulse" : ""} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                            {a.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px] mt-0.5">{a.desc}</p>
                        </div>
                      </div>

                      {/* Lore block */}
                      <p className="text-[10px] italic text-slate-500 leading-normal border-l border-white/5 pl-2.5">
                        &ldquo;{a.lore}&rdquo;
                      </p>

                      {/* Dynamic Progress Bar */}
                      <div>
                        <div className="flex justify-between items-baseline text-[9px] font-mono text-slate-400 mb-1.5">
                          <span>Progress: <strong className={a.unlocked ? "text-emerald-400" : "text-slate-300"}>{a.progress.current}</strong> / {a.progress.target}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            className={`h-full rounded-full bg-gradient-to-r ${
                              a.unlocked 
                                ? "from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                : "from-slate-700 to-slate-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Boost Multiplier Info */}
                      <div className="border-t border-white/[0.03] pt-2.5 mt-0.5 flex justify-between items-center text-[9px] uppercase tracking-wider font-mono">
                        <span className="text-slate-500 font-bold">Buff Applied:</span>
                        <span className={`font-black ${a.unlocked ? "text-emerald-400 animate-pulse" : "text-slate-600"}`}>
                          {a.unlocked ? a.booster : "LOCKED"}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
