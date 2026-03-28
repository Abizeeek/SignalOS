import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '9 AM', signal: 80, noise: 20 },
  { time: '10 AM', signal: 95, noise: 10 },
  { time: '11 AM', signal: 85, noise: 30 },
  { time: '12 PM', signal: 40, noise: 60 },
  { time: '1 PM', signal: 30, noise: 70 },
  { time: '2 PM', signal: 70, noise: 40 },
  { time: '3 PM', signal: 90, noise: 15 },
  { time: '4 PM', signal: 75, noise: 35 },
];

export function SignalChart() {
  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-200">Focus Quality</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-slate-400">Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
            <span className="text-slate-400">Noise</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNoise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="noise" stroke="#f43f5e" strokeOpacity={0.5} fillOpacity={1} fill="url(#colorNoise)" />
            <Area type="monotone" dataKey="signal" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSignal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
