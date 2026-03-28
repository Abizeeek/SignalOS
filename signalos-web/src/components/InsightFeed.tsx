import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Sparkles, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export function InsightFeed() {
  const { insights } = useAppContext();

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'SUCCESS': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      default: return { icon: Info, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-indigo-400" size={20} />
        <h3 className="text-lg font-medium text-slate-200">Executive Intelligence</h3>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {insights.map((insight, i) => {
          const styles = getSeverityStyles(insight.severity);
          const Icon = styles.icon;
          
          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              key={insight.id}
              className={clsx(
                "p-4 rounded-2xl border flex gap-4 transition-colors hover:bg-white/5",
                styles.border, styles.bg
              )}
            >
              <div className="mt-0.5">
                <Icon size={18} className={styles.color} />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">
                  {insight.type.replace('_', ' ')}
                </div>
                <p className="text-sm text-slate-300 leading-snug">
                  {insight.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
