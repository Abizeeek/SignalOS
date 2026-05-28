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
import { Auth } from './components/Auth';

function App() {
  const { activeTab, user, setUser } = useAppContext();

  if (!user) {
    const handleLogin = (userId: string, username: string) => {
      localStorage.setItem('signalos_userId', userId);
      localStorage.setItem('signalos_username', username);
      setUser({ id: userId, username });
    };
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Tasks':
        return <TaskPlanner />;
      case 'Insights':
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <InsightFeed />
            </div>
          </div>
        );
      case 'Finance':
        return <FinanceTracker />;
      case 'Reports':
        return <Reports />;
      case 'Schedule':
        return <Schedule />;
      case 'Focus War':
        return <FocusWar />;
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
