import { Search, Bell, Command, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function Header() {
  const { mode, setMode } = useAppContext();

  return (
    <header className="h-20 flex justify-between items-center px-8 border-b border-white/5 glass-panel z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-light tracking-tight text-slate-100">Executive Dashboard</h2>
        <div className="h-6 w-px bg-white/10 mx-2" />
        <span className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group flex items-center hidden md:flex">
          <Search className="absolute left-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Command palette..." 
            className="bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all"
          />
          <div className="absolute right-3 flex items-center gap-1 text-[10px] text-slate-500 bg-black/40 px-1.5 py-0.5 rounded">
            <Command size={10} /> K
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="relative">
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="appearance-none bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer transition-all hover:bg-indigo-500/20"
          >
            <option value="FOUNDER" className="bg-slate-900 text-slate-200">Founder Mode</option>
            <option value="OPERATOR" className="bg-slate-900 text-slate-200">Operator Mode</option>
            <option value="MONK" className="bg-slate-900 text-slate-200">Monk Mode</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={14} />
        </div>

        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200 cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow">
          <img 
            src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Felix&backgroundColor=transparent" 
            alt="Profile" 
            className="w-full h-full rounded-full bg-black/50"
          />
        </div>
      </div>
    </header>
  );
}
