import { useState, useEffect } from 'react';
import type { DistractionLog } from '../types';
import { Clock, AlertTriangle } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

export function DistractionTracker() {
  const [distractions, setDistractions] = useState<DistractionLog[]>([]);
  const [source, setSource] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDistractions = async () => {
    try {
      const res = await fetchWithAuth('/distractions');
      if (res.ok) {
        const data = await res.json();
        setDistractions(data);
      }
    } catch (e) {
      console.error('Failed to load distractions', e);
    }
  };

  useEffect(() => {
    fetchDistractions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !duration) return;
    setLoading(true);

    try {
      await fetchWithAuth('/distractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          durationMinutes: parseInt(duration, 10),
        }),
      });
      setSource('');
      setDuration('');
      fetchDistractions();
    } catch (e) {
      console.error('Failed to save distraction', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Distraction Log
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input 
          type="text" 
          placeholder="Source (e.g. Twitter)" 
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
        />
        <input 
          type="number" 
          placeholder="Mins" 
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-20 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
          min="1"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? '...' : 'Log'}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar space-y-3">
        {distractions.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">
            No distractions logged today. Great focus!
          </div>
        ) : (
          distractions.slice().reverse().map((d) => (
            <div key={d.id} className="bg-slate-800/30 border border-rose-500/10 rounded-xl p-3 flex justify-between items-center">
              <div className="font-medium text-slate-300 text-sm">{d.source}</div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Clock className="w-3 h-3" />
                {d.durationMinutes}m
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
