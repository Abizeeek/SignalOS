import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Activity, Target, Zap, Brain, Clock, AlertTriangle, Trophy, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(v);
      }
    });
    return controls.stop;
  }, [value]);

  return <span>{displayValue.toFixed(decimals)}</span>;
}

export function KPICards() {
  const { kpis } = useAppContext();

  const metrics = [
    { name: 'Productivity Score', value: kpis.productivityScore || 0, decimals: 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { name: 'Task Completion', value: kpis.taskCompletionRate || 0, decimals: 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', suffix: '%' },
    { name: 'Signal-to-Noise', value: kpis.snr, decimals: 1, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { name: 'Leverage Score', value: kpis.leverageScore, decimals: 0, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { name: 'Priority Integrity', value: kpis.priorityIntegrity, decimals: 0, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Deep Work Index', value: kpis.deepWorkIndex, decimals: 0, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Effective Focus', value: kpis.effectiveFocusTime, decimals: 1, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', suffix: 'h' },
    { name: 'Decision Fatigue', value: kpis.decisionFatigue, decimals: 0, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {metrics.map((m, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          key={m.name}
          className={clsx(
            "glass-panel rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border cursor-default",
            m.border
          )}
        >
          <div className={clsx("absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-10 -mt-10 opacity-20 group-hover:opacity-40 transition-opacity", m.bg)} />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.name}</h3>
            <div className={clsx("p-2 rounded-lg", m.bg)}>
              <m.icon size={16} className={m.color} />
            </div>
          </div>
          
          <div className="relative z-10 flex items-baseline gap-1">
            <span className={clsx("text-4xl font-light tracking-tight", m.color, "text-glow")}>
              <Counter value={m.value} decimals={m.decimals} />
            </span>
            {m.suffix && <span className="text-sm text-slate-500 font-medium">{m.suffix}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
