import { NoiseOverlay } from './components/NoiseOverlay';
import { CursorGlow } from './components/CursorGlow';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ActiveSession } from './components/ActiveSession';
import { AICoach } from './components/AICoach';
import { TaskPlanner } from './components/TaskPlanner';
import { InsightFeed } from './components/InsightFeed';
import { FinanceTracker } from './components/FinanceTracker';
import { Reports } from './components/Reports';
import { Schedule } from './components/Schedule';
import { FocusWar } from './components/FocusWar';
import { useAppContext } from './context/AppContext';
import { ActivityRecorder } from './components/ActivityRecorder';
import { DistractionTracker } from './components/DistractionTracker';
import { Settings } from './components/Settings';
import { SessionHistory } from './components/SessionHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

function App() {
  const { activeTab, showDistractionAlert } = useAppContext();

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Tasks':
        return (
          <div className="absolute inset-0 overflow-y-auto p-8 pb-36 custom-scrollbar">
            <div className="max-w-[1200px] mx-auto w-full">
              <TaskPlanner />
            </div>
          </div>
        );
      case 'Insights':
        return (
          <div className="absolute inset-0 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full">
              <InsightFeed />
            </div>
          </div>
        );
      case 'Activity':
        return (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <ActivityRecorder />
          </div>
        );
      case 'History':
        return (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <SessionHistory />
          </div>
        );
      case 'Finance':
        return (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <FinanceTracker />
          </div>
        );
      case 'Reports':
        return <Reports />;
      case 'Schedule':
        return (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <Schedule />
          </div>
        );
      case 'Focus War':
        return (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <FocusWar />
          </div>
        );
      case 'Distractions':
        return (
          <div className="absolute inset-0 overflow-y-auto p-8 pb-36 custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full">
              <DistractionTracker />
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            <Settings />
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-300 mb-2">{activeTab}</div>
              <p>This section is under construction or visible elsewhere.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col text-slate-100">
      <NoiseOverlay />
      <CursorGlow />
      <ActiveSession />
      <AICoach />
      
      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 h-screen overflow-hidden">
        <Sidebar />

        {/* Dashboard Area */}
        <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
          <Header />
          <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Whole-Window Red Warning distraction overlay */}
      <AnimatePresence>
        {showDistractionAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none border-[24px] border-red-600/90 shadow-[inset_0_0_200px_rgba(239,68,68,0.85)] flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-[3px] transition-all"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-red-700 via-rose-800 to-red-900 border border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.5)] px-10 py-6 rounded-3xl text-white font-black text-2xl uppercase tracking-widest flex items-center gap-5 pointer-events-auto select-none"
            >
              <AlertTriangle className="animate-pulse text-yellow-300" size={36} />
              <div className="flex flex-col gap-0.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-rose-200">WARNING: DISTRACTION DETECTED!</span>
                <span className="text-xs font-medium tracking-normal text-rose-200/80 normal-case font-mono mt-1">Return focus to the SignalOS window to secure telemetry.</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
