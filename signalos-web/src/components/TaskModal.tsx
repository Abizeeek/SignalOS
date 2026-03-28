import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, SignalType, LeverageType, Priority } from '../types';
import { useAppContext } from '../context/AppContext';
import { X, Save, Trash2 } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskModal({ task, onClose }: TaskModalProps) {
  const { addTask, updateTask, deleteTask } = useAppContext();
  const isEditing = !!task;

  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    category: 'General',
    signalType: 'SIGNAL',
    leverageType: 'HIGH',
    taskNature: 'DEEP_WORK',
    priority: 'NORMAL',
    tags: [],
    estimatedDuration: 60,
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && task) {
      updateTask({ ...task, ...formData } as Task);
    } else {
      addTask(formData as Omit<Task, 'id' | 'order'>);
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border-white/10"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-medium text-slate-100">{isEditing ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-900/80">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Task Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                placeholder="E.g., Architect Engine Rebuild"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Signal Type</label>
                <select
                  value={formData.signalType}
                  onChange={e => setFormData({ ...formData, signalType: e.target.value as SignalType })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="SIGNAL" className="bg-slate-900">Signal</option>
                  <option value="NOISE" className="bg-slate-900">Noise</option>
                  <option value="NEUTRAL" className="bg-slate-900">Neutral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Leverage</label>
                <select
                  value={formData.leverageType}
                  onChange={e => setFormData({ ...formData, leverageType: e.target.value as LeverageType })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="HIGH" className="bg-slate-900">High</option>
                  <option value="MEDIUM" className="bg-slate-900">Medium</option>
                  <option value="LOW" className="bg-slate-900">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration (mins)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.estimatedDuration}
                  onChange={e => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="URGENT" className="bg-slate-900">Urgent</option>
                  <option value="HIGH" className="bg-slate-900">High</option>
                  <option value="NORMAL" className="bg-slate-900">Normal</option>
                  <option value="LOW" className="bg-slate-900">Low</option>
                </select>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10 flex justify-between items-center">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 px-4 py-2 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                >
                  <Trash2 size={16} /> Delete
                </button>
              ) : <div />}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
