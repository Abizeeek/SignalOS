import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';

export function ScreenTimeChart() {
  const { activityMetrics, kpis } = useAppContext();

  const productiveMinutes = kpis.productiveTime || 0;
  const distractedMinutes = kpis.distractionTime || 0;
  const totalMinutes = kpis.screenTime || (productiveMinutes + distractedMinutes);

  const data = [
    { name: 'Productive', time: productiveMinutes },
    { name: 'Idle', time: distractedMinutes }
  ];
  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col">
        <h3 className="text-lg font-medium text-slate-200">Screen Time</h3>
        <span className="text-sm text-slate-400 mt-1">
          Total: {totalMinutes} mins {activityMetrics.isRecording ? '- live tracking' : ''}
        </span>
      </div>
      
      <div className="flex-1 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="time" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Productive' ? '#6366f1' : '#f43f5e'} opacity={entry.name === 'Productive' ? 0.8 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
