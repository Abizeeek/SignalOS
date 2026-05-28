import { X, Calculator, HelpCircle, Shield, Award, AlertCircle, Info, Flame, Zap } from 'lucide-react';
import { motion, useDragControls } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

interface KPIDetailsModalProps {
  kpiType: string;
  onClose: () => void;
  value: number | string;
}

export function KPIDetailsModal({ kpiType, onClose, value }: KPIDetailsModalProps) {
  const { sessions, tasks, kpis } = useAppContext();

  // Sort sessions chronologically
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Parse telemetry values
  let switchCount = 0;
  let shortSessionCount = 0;
  const domainsSet = new Set<string>();

  let lastTaskName = '';
  sortedSessions.forEach((s) => {
    if (lastTaskName && s.taskName !== lastTaskName) {
      switchCount++;
    }
    lastTaskName = s.taskName;

    if (s.duration < 15) {
      shortSessionCount++;
    }

    const task = tasks.find(t => t.id === s.taskId || t.name === s.taskName);
    if (task && task.tags && task.tags.length > 0) {
      task.tags.forEach(tag => domainsSet.add(tag));
    } else {
      domainsSet.add(s.taskName);
    }
  });

  // Calculate planned task domains for baseline
  const plannedDomains = new Set<string>();
  tasks.forEach(t => {
    if (t.tags && t.tags.length > 0) {
      t.tags.forEach(tag => plannedDomains.add(tag));
    } else {
      plannedDomains.add(t.name);
    }
  });

  // Fallback to 3 unique planned domains if no tasks are added to match baseline fatigue of 9
  const uniquePlannedDomainsCount = plannedDomains.size || 3;
  const domainsCount = sortedSessions.length > 0 ? domainsSet.size : uniquePlannedDomainsCount;
  const activeDomains = sortedSessions.length > 0 ? Array.from(domainsSet) : Array.from(plannedDomains).slice(0, 3);
  if (activeDomains.length === 0) {
    activeDomains.push("Focus Target Alpha", "Focus Target Beta", "Focus Target Gamma");
  }

  const calculatedFatigue = (switchCount * 0.4) + (shortSessionCount * 0.3) + (domainsCount * 0.3);
  const fatigueScore = Math.round(calculatedFatigue * 10);

  const getDetailContent = () => {
    switch (kpiType) {
      case 'productivityScore':
        const productiveMinutes = kpis.productiveTime || sessions.reduce((acc, s) => acc + s.duration, 0);
        const distractionMinutes = kpis.distractionTime || 0;
        const totalMinutes = productiveMinutes + distractionMinutes;
        const timeRatio = totalMinutes === 0 ? 0 : Math.round((productiveMinutes / totalMinutes) * 100);
        const completedTasksCount = tasks.filter(t => t.completed).length;
        const totalTasksCount = tasks.length;
        const taskRatio = totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);

        return {
          title: 'Productivity Score',
          icon: Award,
          tone: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
          formula: 'Score = (Time Score × 0.6) + (Task Completion Rate × 0.4)',
          desc: 'Your unified efficiency score. It aggregates your active time ratio (focused time vs distractions) with your raw task completion rate to calculate how effectively you executed today\'s goals.',
          reasons: [
            'High Time Ratio: Spending large blocks of time on signal tasks without logging distraction entries.',
            'Task Completion: Successfully completing your tasks, especially high leverage ones, inside the planners.'
          ],
          tips: [
            'Stick to your scheduled calendar blocks to keep focused time high.',
            'Break down large tasks into smaller, actionable items so you can mark them complete throughout the day.'
          ],
          auditTitle: "Productivity Score Audit",
          auditContent: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Time Score (60% weight)</div>
                  <div className="text-xl font-bold text-white mt-1">{timeRatio}%</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{productiveMinutes}m / {totalMinutes}m total focus</div>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Task Score (40% weight)</div>
                  <div className="text-xl font-bold text-white mt-1">{taskRatio}%</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{completedTasksCount} / {totalTasksCount} tasks completed</div>
                </div>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl font-mono text-xs text-indigo-200">
                Formula: ({timeRatio}% × 0.6) + ({taskRatio}% × 0.4) = {Math.round(timeRatio * 0.6 + taskRatio * 0.4)}%
              </div>
            </div>
          )
        };
      case 'snr':
        const prodMin = kpis.productiveTime || sessions.reduce((acc, s) => acc + s.duration, 0);
        const distMin = kpis.distractionTime || 0;
        const snrRatio = distMin === 0 ? prodMin.toFixed(1) : (prodMin / distMin).toFixed(1);

        return {
          title: 'Signal-to-Noise Ratio (SNR)',
          icon: Calculator,
          tone: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
          formula: 'SNR = Productive Focus Minutes ÷ Distraction & Overhead Minutes',
          desc: 'Measures your strategic leverage. Focus spent on high-impact building (Signals) versus administrative reactive chores or social decoy browsing (Noise/Distractions).',
          reasons: [
            'Time division: Spending deep work streaks on core builder projects.',
            'Low distractions: Keeping context switches and off-topic browsing to an absolute minimum.'
          ],
          tips: [
            'Batch your administrative chores (emails, messages) into a single 30-minute block at the end of the day.',
            'Use Monk Mode during your prime hours to protect your high-signal work blocks.'
          ],
          auditTitle: "Signal-To-Noise Telemetry Audit",
          auditContent: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Productive Time (Signal)</div>
                  <div className="text-xl font-bold text-white mt-1">{prodMin} min</div>
                  <div className="text-[10px] text-slate-400 mt-1">High-impact execution focus</div>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Distracted Time (Noise)</div>
                  <div className="text-xl font-bold text-white mt-1">{distMin} min</div>
                  <div className="text-[10px] text-slate-400 mt-1">Decoys, switches, or blurs</div>
                </div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl font-mono text-xs text-emerald-200">
                Calculated SNR: {prodMin}m ÷ {distMin || 1}m = {snrRatio}x leverage multiplier
              </div>
            </div>
          )
        };
      case 'leverageScore':
        const totalMin = sessions.reduce((acc, s) => acc + s.duration, 0) || kpis.productiveTime || 0;
        const highLevMin = sessions
          .filter(s => {
            const t = tasks.find(tsk => tsk.id === s.taskId || tsk.name === s.taskName);
            return t?.leverageType === 'HIGH';
          })
          .reduce((acc, s) => acc + s.duration, 0);
        const leveragePercentage = totalMin === 0 ? 0 : Math.round((highLevMin / totalMin) * 100);

        return {
          title: 'Leverage Score',
          icon: Shield,
          tone: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
          formula: 'Leverage = (High Leverage Minutes / Total Focus Minutes) × 100',
          desc: 'Evaluates your focus ROI. Evaluates whether you are spending your valuable hours on high-multiplier activities (like design, delegation, system architecture) or low-multiplier routine tasks (repetitive admin, data processing).',
          reasons: [
            'Task Nature: Planning high-leverage BUILD tasks.',
            'Focus Allocation: Actually spending your longest uninterrupted focus blocks on high-leverage tasks.'
          ],
          tips: [
            'Identify tasks that can be delegated or automated and push them off your primary schedule.',
            'Dedicate your morning focus slots strictly to high-multiplier building.'
          ],
          auditTitle: "Leverage Dynamic Telemetry Audit",
          auditContent: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">High Leverage Focus</div>
                  <div className="text-xl font-bold text-white mt-1">{highLevMin} min</div>
                  <div className="text-[10px] text-slate-400 mt-1">Design, Architecture & BUILD</div>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Focus Time</div>
                  <div className="text-xl font-bold text-white mt-1">{totalMin} min</div>
                  <div className="text-[10px] text-slate-400 mt-1">All focus minutes combined</div>
                </div>
              </div>
              <div className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-xl font-mono text-xs text-sky-200">
                Formula: ({highLevMin}m / {totalMin || 1}m) × 100 = {leveragePercentage}% leverage ratio
              </div>
            </div>
          )
        };
      case 'priorityIntegrity':
        return {
          title: 'Priority Integrity',
          icon: Award,
          tone: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
          formula: 'Integrity = (Focus on Top 3 Priorities / Total Planned Time) × 100',
          desc: 'Measures executive alignment. It assesses how well you adhered to your planned top three daily goals versus getting sidetracked by secondary items or unplanned reactive demands.',
          reasons: [
            'Prioritization: Completing the core top 3 tasks defined in your daily planner.',
            'Adherence: Resisting the urge to switch to lower priority tasks that feel easier.'
          ],
          tips: [
            'Do your highest priority task first thing in the morning (Eat the Frog).',
            'Write down your top 3 tasks on a sticky note or keep them locked at the top of your dashboard.'
          ],
          auditTitle: "Priority Integrity Audit",
          auditContent: (
            <div className="space-y-3 font-mono text-xs text-slate-300 bg-slate-950/30 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span>Top 3 Daily Tasks Mapped:</span>
                <span className="text-violet-400 font-bold">{Math.min(3, tasks.length)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Completed Priorities:</span>
                <span className="text-emerald-400">{tasks.filter(t => t.completed && t.priority === 'HIGH').length}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Integrity Value:</span>
                <span className="text-white font-bold">{value}%</span>
              </div>
            </div>
          )
        };
      case 'deepWorkIndex':
        const deepBlocks = sessions.filter(s => s.duration >= 25 && s.distractions === 0).length;
        const totalBlocksCount = sessions.length;

        return {
          title: 'Deep Work Index',
          icon: Flame,
          tone: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
          formula: 'DWI = (Uninterrupted Focus Blocks ≥ 25m) Weighted Coefficient',
          desc: 'Measures focus intensity. High-level building requires uninterrupted cognitive immersion. This index tracks the frequency and length of deep work segments without distractions or visibility switches.',
          reasons: [
            'Streak lengths: Maintaining focus blocks longer than 25 minutes.',
            'Unbroken focus: Zero window switching, browser tab shifts, or distraction logs.'
          ],
          tips: [
            'Start with 25-minute Pomodoro sessions and gradually scale to 50-minute deep blocks.',
            'Turn off all desktop and mobile notifications before beginning a deep work block.'
          ],
          auditTitle: "Deep Work Telemetry Audit",
          auditContent: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Deep Work Blocks (≥25m)</div>
                  <div className="text-xl font-bold text-white mt-1">{deepBlocks} blocks</div>
                  <div className="text-[10px] text-slate-400 mt-1">Zero distraction sessions</div>
                </div>
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Focus Blocks</div>
                  <div className="text-xl font-bold text-white mt-1">{totalBlocksCount} sessions</div>
                  <div className="text-[10px] text-slate-400 mt-1">All logged sessions</div>
                </div>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl font-mono text-xs text-rose-200">
                Index Level: {deepBlocks > 0 ? `${deepBlocks} intense blocks detected today` : 'No deep blocks of 25m+ logged yet today'}
              </div>
            </div>
          )
        };
      case 'attentionResidue':
        return {
          title: 'Attention Residue',
          icon: AlertCircle,
          tone: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
          formula: 'Residue = Switch Count × Priority Penalty Coefficient',
          desc: 'Measures cognitive overhead. When you switch from one task to another, your brain does not immediately transition. A "residue" of attention remains locked on the previous task, severely dragging down your focus performance.',
          reasons: [
            'Context Switching: Alternating between coding, emailing, and messaging in rapid succession.',
            'Multi-tasking: Trying to handle several open projects simultaneously.'
          ],
          tips: [
            'Work on exactly one single task at a time for at least 30-50 minutes.',
            'Close all browser tabs that are unrelated to the current active task.'
          ],
          auditTitle: "Attention Residue Calculations",
          auditContent: (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Task Switches:</span>
                  <span className="text-amber-400 font-bold">{switchCount} switches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deduction Coefficient:</span>
                  <span className="text-slate-200">× 10.0 penalty</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5 text-sm font-bold">
                  <span className="text-white">Attention Residue Score:</span>
                  <span className="text-amber-400">{value}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal italic">
                {switchCount > 0 
                  ? `Attention residue is degrading your cognitive processing by roughly ${Math.min(100, switchCount * 8)}%. Focus on one task longer to clear this residue.` 
                  : "Perfect attention alignment! No task switching detected during active focus blocks today."
                }
              </p>
            </div>
          )
        };
      case 'decisionFatigue':
        return {
          title: 'Decision Fatigue',
          icon: Info,
          tone: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
          formula: 'Fatigue = ((Switch Count × 0.4) + (Short Segments × 0.3) + (Unique Domains × 0.3)) × 10',
          desc: 'Estimates cognitive battery drain. Every decision to switch tasks, review emails, or answer messages consumes cognitive fuel. High frequencies of disjointed work segments deplete your willpower battery, causing poor executive decisions later.',
          reasons: [
            'Frequent Switches: High distraction logs or window focus blurs.',
            'Fragmentation: Working in short bursts of less than 15 minutes before getting distracted.'
          ],
          tips: [
            'Automate or pre-plan your schedule the night before so you do not waste decisions on "what to do next".',
            'Take high-quality screen-free breaks (like a short walk) to recharge your cognitive battery.'
          ],
          auditTitle: "Decision Fatigue Telemetry Audit",
          auditContent: (
            <div className="space-y-4">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Switches (×4)</div>
                  <div className="text-lg font-bold text-white mt-1">{switchCount}</div>
                  <div className="text-[9px] text-indigo-400 font-mono mt-0.5">+{(switchCount * 4).toFixed(0)} pts</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Short Focus (×3)</div>
                  <div className="text-lg font-bold text-white mt-1">{shortSessionCount}</div>
                  <div className="text-[9px] text-rose-400 font-mono mt-0.5">+{(shortSessionCount * 3).toFixed(0)} pts</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Task Domains (×3)</div>
                  <div className="text-lg font-bold text-white mt-1">{domainsCount}</div>
                  <div className="text-[9px] text-sky-400 font-mono mt-0.5">+{(domainsCount * 3).toFixed(0)} pts</div>
                </div>
              </div>

              {/* Formula & Equation */}
              <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-2xl space-y-2">
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">Telemetry Equation:</div>
                <div className="font-mono text-xs text-slate-200">
                  Fatigue = ({switchCount} × 4.0) + ({shortSessionCount} × 3.0) + ({domainsCount} × 3.0) = <span className="text-indigo-400 font-black text-sm">{fatigueScore}</span>
                </div>
              </div>

              {/* Explainer / Logic breakdown */}
              <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 text-xs text-slate-300 space-y-2 leading-relaxed">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Zap size={14} className="text-indigo-400" />
                  Score Explanation (Calculated Fatigue: {value})
                </div>
                {sortedSessions.length === 0 ? (
                  <p>
                    Since you haven't recorded focus sessions yet today, your score of <strong className="text-indigo-400">9</strong> is calculated from your <strong className="text-white">{domainsCount} unique planned tasks/domains</strong> ({domainsCount} × 3.0 = 9). This establishes your starting cognitive baseline. Zero task switches and zero focus fragmentation means your executive willpower is currently fully conserved! 🔋
                  </p>
                ) : (
                  <p>
                    Your current score is <strong className="text-indigo-400">{value}</strong>. You have logged <strong className="text-white">{sessions.length} sessions</strong> spanning <strong className="text-white">{domainsCount} unique domains</strong> (contributing {(domainsCount * 3).toFixed(0)} points). You completed <strong className="text-white">{switchCount} task switches</strong> (adding {(switchCount * 4).toFixed(0)} points) and <strong className="text-white">{shortSessionCount} short focus sessions</strong> (adding {(shortSessionCount * 3).toFixed(0)} points). Keep sessions longer than 15 minutes to prevent focus fragmentation!
                  </p>
                )}
                {domainsCount > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Active Target Domains Today:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDomains.map((dom, i) => (
                        <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200">
                          {dom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        };
      default:
        return {
          title: 'Executive Metric',
          icon: HelpCircle,
          tone: 'text-slate-400 border-slate-500/20 bg-slate-500/5',
          formula: 'Custom SignalOS Computation',
          desc: 'Advanced telemetry focus metric tracking active signals across your work environment.',
          reasons: ['Logging productive focus sessions.', 'Keeping distractions low.'],
          tips: ['Maintain focus blocks.', 'Utilize monk mode protocols.'],
          auditTitle: "Telemetry Details",
          auditContent: <div className="text-slate-400 text-xs italic">Telemetry is active and processing live signals.</div>
        };
    }
  };

  const content = getDetailContent();
  const Icon = content.icon;
  const dragControls = useDragControls();

  return (
    <div className="fixed inset-0 z-50 p-4 flex justify-center items-start pt-12 md:pt-20 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={true}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        dragElastic={0.1}
        className="glass-panel w-full max-w-2xl rounded-3xl border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto"
      >
        {/* Draggable Header */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="p-6 pb-4 border-b border-white/5 flex justify-between items-center cursor-grab active:cursor-grabbing select-none bg-slate-900/50 rounded-t-3xl flex-shrink-0"
        >
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${content.tone} shadow-lg`}>
              <Icon size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{content.title}</h2>
              <div className="text-slate-400 font-mono text-sm mt-1 flex items-baseline gap-2">
                Current telemetry: <span className="text-indigo-400 text-lg font-bold">{value}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            onPointerDown={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-2 rounded-xl hover:bg-white/5 animate-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content container */}
        <div 
          onPointerDown={(e) => e.stopPropagation()}
          className="p-8 pt-6 space-y-6 overflow-y-auto custom-scrollbar flex-1"
        >
          {/* Description Section */}
          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/20 rounded-2xl border border-white/5 p-4">
            {content.desc}
          </p>

          {/* Mathematical Formula */}
          <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
              <Calculator size={12} />
              Focus Metric Formula
            </div>
            <div className="text-slate-200 font-mono text-xs md:text-sm tracking-tight overflow-x-auto whitespace-nowrap py-1">
              {content.formula}
            </div>
          </div>

          {/* DYNAMIC TELEMETRY BREAKDOWN WIDGET */}
          {content.auditTitle && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                {content.auditTitle}
              </h4>
              {content.auditContent}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Drivers */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Award size={14} className="text-indigo-400" />
                Key Score Drivers
              </h4>
              <ul className="space-y-3">
                {content.reasons.map((r, index) => (
                  <li key={index} className="text-xs text-slate-300 leading-relaxed flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coaching Recommendations */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Flame size={14} className="text-rose-400" />
                Executive Tips
              </h4>
              <ul className="space-y-3">
                {content.tips.map((t, index) => (
                  <li key={index} className="text-xs text-slate-300 leading-relaxed flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/30 flex justify-end rounded-b-3xl flex-shrink-0">
          <button 
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Acknowledge Intelligence
          </button>
        </div>
      </motion.div>
    </div>
  );
}
