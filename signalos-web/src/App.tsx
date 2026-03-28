import { NoiseOverlay } from './components/NoiseOverlay';
import { CursorGlow } from './components/CursorGlow';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ActiveSession } from './components/ActiveSession';
import { AICoach } from './components/AICoach';
import { TaskPlanner } from './components/TaskPlanner';
import { InsightFeed } from './components/InsightFeed';
import { useAppContext } from './context/AppContext';

function App() {
  const { activeTab } = useAppContext();
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
          {activeTab === 'Dashboard' && <Dashboard />}
          {activeTab === 'Tasks' && <TaskPlanner />}
          {activeTab === 'Insights' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <InsightFeed />
              </div>
            </div>
          )}
          {['Sessions', 'Reports', 'Settings', 'AI Coach'].includes(activeTab) && (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300 mb-2">{activeTab}</div>
                <p>This section is under construction or visible elsewhere.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
