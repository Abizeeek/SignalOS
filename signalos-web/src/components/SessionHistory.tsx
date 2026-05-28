import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  History, Clock, Keyboard, Download, 
  Bookmark, Activity, ChevronDown, ChevronUp, Calendar, Trash2 
} from 'lucide-react';

export function SessionHistory() {
  const { recordedSessions, setRecordedSessions } = useAppContext();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Compute Overall Telemetry Aggregates
  const stats = useMemo(() => {
    if (recordedSessions.length === 0) {
      return { count: 0, avgScore: 0, totalActiveMins: 0, totalInputs: 0 };
    }
    const count = recordedSessions.length;
    const avgScore = Math.round(
      recordedSessions.reduce((acc, s) => acc + s.attentionScore, 0) / count
    );
    const totalActiveMins = Math.round(
      recordedSessions.reduce((acc, s) => acc + s.activeSeconds, 0) / 60
    );
    const totalInputs = recordedSessions.reduce(
      (acc, s) => acc + s.clicks + s.keyPresses, 
      0
    );

    return { count, avgScore, totalActiveMins, totalInputs };
  }, [recordedSessions]);

  const toggleExpand = (index: number) => {
    const id = `session-${index}`;
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const deleteSession = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session from your local history?")) {
      setRecordedSessions(prev => prev.filter((_, idx) => idx !== indexToDelete));
      setExpandedSessionId(null);
    }
  };

  const clearAllHistory = () => {
    if (confirm("🚨 WARNING: Are you sure you want to completely clear your entire local focus session history? This action is irreversible.")) {
      setRecordedSessions([]);
      setExpandedSessionId(null);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-8 pb-36 custom-scrollbar">
      <div className="max-w-[1200px] mx-auto w-full space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-3">
              <History className="text-indigo-400" size={30} />
              Session Logs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Audit and download deep-work recordings, distraction blurs, and gaze bookmarks.
            </p>
          </div>
          {recordedSessions.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="px-4 py-2 border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Clear All Logs
            </button>
          )}
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Sessions Count</span>
            <span className="text-3xl font-bold font-mono text-slate-100">{stats.count}</span>
            <Activity className="absolute bottom-4 right-4 text-slate-700 opacity-20" size={24} />
          </div>
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Avg Focus Score</span>
            <span className="text-3xl font-bold font-mono text-indigo-400">{stats.avgScore}%</span>
            <Bookmark className="absolute bottom-4 right-4 text-indigo-500 opacity-10" size={24} />
          </div>
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Accumulated Active Time</span>
            <span className="text-3xl font-bold font-mono text-emerald-400">{stats.totalActiveMins}m</span>
            <Clock className="absolute bottom-4 right-4 text-emerald-500 opacity-10" size={24} />
          </div>
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Total Input Signals</span>
            <span className="text-3xl font-bold font-mono text-sky-400">{stats.totalInputs}</span>
            <Keyboard className="absolute bottom-4 right-4 text-sky-500 opacity-10" size={24} />
          </div>
        </div>

        {/* CHRONOLOGICAL LOGS LIST */}
        <div className="space-y-4">
          {recordedSessions.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                <Calendar className="text-slate-600" size={28} />
              </div>
              <div>
                <h3 className="text-slate-300 font-bold">No completed sessions recorded yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Start recording your activity inside the "Activity" tab, complete a focus block, and your telemetry summaries will instantly populate here permanently.
                </p>
              </div>
            </div>
          ) : (
            recordedSessions.map((session, index) => {
              const isExpanded = expandedSessionId === `session-${index}`;
              return (
                <div 
                  key={index}
                  className={`glass-panel rounded-3xl overflow-hidden border transition-all duration-300 ${
                    isExpanded 
                      ? 'border-indigo-500/30 bg-indigo-500/5 shadow-[0_4px_30px_rgba(99,102,241,0.05)]' 
                      : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Collapsed Header Card */}
                  <div 
                    onClick={() => toggleExpand(index)}
                    className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border ${
                        session.attentionScore > 75 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : session.attentionScore > 40
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                      }`}>
                        <Activity size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm">{session.taskName}</h3>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                          Recorded on {session.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex gap-4 items-center">
                        <div className="text-right">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Focus</span>
                          <span className="font-mono text-xs font-bold text-indigo-300">{session.attentionScore}%</span>
                        </div>
                        <div className="text-right border-l border-white/10 pl-4">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Duration</span>
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {Math.floor(session.duration / 60)}m {session.duration % 60}s
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => deleteSession(index, e)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 size={15} />
                        </button>
                        <div className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-white/5 border border-white/5">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-white/5 space-y-5 animate-in fade-in duration-200">
                      
                      {/* Telemetry metrics row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                        <div className="bg-slate-900/40 border border-white/5 p-3.5 rounded-2xl">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Active Time</span>
                          <span className="text-lg font-bold font-mono text-emerald-400">
                            {Math.floor(session.activeSeconds / 60)}m {session.activeSeconds % 60}s
                          </span>
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 p-3.5 rounded-2xl">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Idle Time</span>
                          <span className="text-lg font-bold font-mono text-amber-400">
                            {Math.floor(session.idleSeconds / 60)}m {session.idleSeconds % 60}s
                          </span>
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 p-3.5 rounded-2xl">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Distraction Switches</span>
                          <span className="text-lg font-bold font-mono text-rose-400">
                            {session.visibilityChanges} counts
                          </span>
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 p-3.5 rounded-2xl">
                          <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Mouse/Key Interactions</span>
                          <span className="text-lg font-bold font-mono text-sky-400">
                            {session.clicks} click / {session.keyPresses} key
                          </span>
                        </div>
                      </div>

                      {/* Timeline bookmarks & notes list */}
                      {session.notes && session.notes.length > 0 && (
                        <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4.5">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <Bookmark size={12} fill="currentColor" className="text-indigo-400" />
                            Logged Timeline Bookmarks
                          </h4>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            {session.notes.map(n => (
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

                      {/* Download section */}
                      {session.recordingUrl && (
                        <div className="flex justify-end pt-2">
                          <a
                            href={session.recordingUrl}
                            download={`signalos-session-recording-${Date.now()}.webm`}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                          >
                            <Download size={14} />
                            Download WebM Recording
                          </a>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
