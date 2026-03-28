import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Play, Pause, Square, AlertCircle } from 'lucide-react';

export function ActiveSession() {
  const { activeSession, setActiveSession, sessions, setSessions, tasks, updateTask } = useAppContext();
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!activeSession || isPaused) return;

    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, isPaused]);

  if (!activeSession) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeTask = tasks.find(t => t.id === activeSession.taskId);

  const handleStop = () => {
    const completedSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      duration: Math.round(elapsed / 60), // in minutes
    };
    setSessions([...sessions, completedSession]);

    if (activeTask) {
      updateTask({ ...activeTask, completed: true });
    }

    setActiveSession(null);
    setElapsed(0);
  };

  const handleDistraction = () => {
    setActiveSession({
      ...activeSession,
      distractions: activeSession.distractions + 1
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="glass-panel border-indigo-500/30 rounded-full px-6 py-3 flex items-center gap-6 shadow-[0_10px_40px_rgba(99,102,241,0.2)] bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-3 h-3">
              {!isPaused && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Deep Work Active</div>
              <div className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
                {activeSession.taskName}
              </div>
            </div>
          </div>

          <div className="text-3xl font-light tracking-tight text-white w-24 text-center text-glow">
            {formatTime(elapsed)}
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-full hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            </button>
            <button 
              onClick={handleStop}
              className="p-3 rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
              title="Stop Session"
            >
              <Square size={18} fill="currentColor" />
            </button>
            <button 
              onClick={handleDistraction}
              className="p-3 rounded-full hover:bg-amber-500/20 text-amber-400 transition-colors relative cursor-pointer"
              title="Log Distraction"
            >
              <AlertCircle size={18} />
              {activeSession.distractions > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center pointer-events-none">
                  {activeSession.distractions}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
