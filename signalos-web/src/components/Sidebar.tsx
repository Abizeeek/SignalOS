import { LayoutDashboard, Target, ShieldAlert, Calendar, Settings, Wallet, BarChart2, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useAppContext } from '../context/AppContext';

export function Sidebar() {
  const { mode, activeTab, setActiveTab } = useAppContext();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tasks', icon: Target },
    { name: 'Distractions', icon: ShieldAlert },
    { name: 'Schedule', icon: Calendar },
    { name: 'Focus War', icon: Zap },
    { name: 'Reports', icon: BarChart2 },
    { name: 'Finance', icon: Wallet },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-l-0 border-y-0 flex flex-col h-full bg-slate-900/50 z-20 shadow-[20px_0_30px_rgba(0,0,0,0.2)]">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-widest text-indigo-400 text-glow">SIGNALOS</h1>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Executive Focus System
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === activeTab;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer',
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="glass-panel rounded-2xl p-4 text-center border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-x-full animate-shimmer" />
          <div className="text-xs text-indigo-300 font-semibold mb-1 relative z-10">{mode} MODE</div>
          <div className="text-[10px] text-slate-400 relative z-10">Active Profile</div>
        </div>
      </div>
    </aside>
  );
}
