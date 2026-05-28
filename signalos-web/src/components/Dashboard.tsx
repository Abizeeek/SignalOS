import { useState } from 'react';
import { KPICards } from './KPICards';
import { InsightFeed } from './InsightFeed';
import { SignalChart } from './PlaceholderChart';
import { TaskPlanner } from './TaskPlanner';
import { ScreenTimeChart } from './ScreenTimeChart';
import { DistractionTracker } from './DistractionTracker';
import { KPIDetailsModal } from './KPIDetailsModal';
import { useAppContext } from '../context/AppContext';
import { Download, MousePointer2, Keyboard, Bookmark, Activity } from 'lucide-react';

export function Dashboard() {
  const [selectedKPI, setSelectedKPI] = useState<{ type: string; value: string | number } | null>(null);
  const { lastSession } = useAppContext();

  const handleCardClick = (type: string, value: string | number) => {
    setSelectedKPI({ type, value });
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-8 pb-36 custom-scrollbar">
      <div className="max-w-[1600px] mx-auto w-full">
        <KPICards onCardClick={handleCardClick} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px] h-[400px]">
          <div className="lg:col-span-2 h-full">
            <SignalChart />
          </div>
          <div className="h-full">
            <InsightFeed />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[300px] h-[300px] mt-6">
          <div className="lg:col-span-2 h-full">
            <ScreenTimeChart />
          </div>
          <div className="h-full">
            <DistractionTracker />
          </div>
        </div>

        {/* LAST COMPLETED RECORDING SESSION SUMMARY CARD */}
        {lastSession && (
          <div className="glass-panel rounded-3xl p-6 mt-6 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  Session Completed at {lastSession.timestamp}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-2 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-400" />
                  Last Recording: {lastSession.taskName}
                </h3>
              </div>
              
              {lastSession.recordingUrl && (
                <a
                  href={lastSession.recordingUrl}
                  download={`signalos-focus-session-${Date.now()}.webm`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  <Download size={15} />
                  Download WebM Recording
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Focus Score</span>
                <span className="text-2xl font-bold font-mono text-indigo-400">{lastSession.attentionScore}%</span>
              </div>
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Active Time</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {Math.floor(lastSession.activeSeconds / 60)}m {lastSession.activeSeconds % 60}s
                </span>
              </div>
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Idle Time</span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {Math.floor(lastSession.idleSeconds / 60)}m {lastSession.idleSeconds % 60}s
                </span>
              </div>
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Clicks</span>
                <span className="text-2xl font-bold font-mono text-sky-400 flex items-center gap-1">
                  <MousePointer2 size={16} /> {lastSession.clicks}
                </span>
              </div>
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4 col-span-2 md:col-span-1">
                <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Keyboard Inputs</span>
                <span className="text-2xl font-bold font-mono text-teal-400 flex items-center gap-1">
                  <Keyboard size={16} /> {lastSession.keyPresses}
                </span>
              </div>
            </div>

            {lastSession.notes && lastSession.notes.length > 0 && (
              <div className="mt-6 bg-slate-950/20 border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Bookmark size={12} fill="currentColor" className="text-indigo-400" />
                  Recorded Session Log & bookmarks
                </h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {lastSession.notes.map(n => (
                    <div key={n.id} className="flex gap-2.5 items-start text-xs border-b border-white/[0.02] pb-1.5 last:border-b-0">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold mt-0.5">{n.time}</span>
                      <span className={n.isBookmark ? "text-indigo-300 font-semibold flex items-center gap-1" : "text-slate-300"}>
                        {n.isBookmark && <Bookmark size={8} fill="currentColor" />} {n.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <TaskPlanner />
        </div>
      </div>

      {selectedKPI && (
        <KPIDetailsModal 
          kpiType={selectedKPI.type}
          value={selectedKPI.value}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </div>
  );
}
