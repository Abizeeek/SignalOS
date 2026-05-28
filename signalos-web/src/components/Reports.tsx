import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Calendar, Activity } from 'lucide-react';
import type { DailyReport } from '../types';
import { fetchWithAuth } from '../utils/api';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth('/api/reports');
        if (res.ok) {
          const data = await res.json();
          // Sort reports by date ascending for charts
          const sorted = [...data].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Format date for display (e.g., 'Mon', 'Tue' or 'MM-DD')
          const formatted = sorted.map(r => {
            const dateObj = new Date(r.date);
            const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return { ...r, displayDate };
          });
          
          setReports(formatted);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-red-400 bg-red-400/10 px-6 py-4 rounded-xl border border-red-400/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-white/60 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white font-medium">
                {entry.name}: {entry.value}
                {entry.name.includes('Time') ? (entry.name === 'Focus Time' ? 'h' : 'm') : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-8 space-y-8 pb-32 animate-fade-in custom-scrollbar">
      {/* Background Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10">
        <h1 className="text-4xl font-light text-white tracking-tight flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 rounded-2xl border border-white/5">
            <Activity className="w-8 h-8 text-indigo-400" />
          </div>
          Performance Analytics
        </h1>
        <p className="text-white/50 mt-2 text-lg">7-Day Historical Trends & Productivity Insights</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-white/40 text-center py-20 flex flex-col items-center">
          <Calendar className="w-16 h-16 mb-4 opacity-50" />
          <p>No historical data available for activity yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          {/* Productivity Trend Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/[0.03] transition-colors duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2.5 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white/90">Productivity Score Trend</h3>
                  <p className="text-sm text-white/50">Overall efficiency mapping over 7 days</p>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="productivityScore" 
                    name="Productivity Score"
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    activeDot={{ r: 8, fill: '#3b82f6', stroke: '#000', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Focus vs Distraction Chart */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/[0.03] transition-colors duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-purple-500/20 p-2.5 rounded-xl">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white/90">Time Allocation Breakdown</h3>
                <p className="text-sm text-white/50">Focus (Hours) vs Distraction (Minutes)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#ffffff40" 
                    tick={{ fill: '#ffffff60', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px', opacity: 0.8 }} />
                  <Bar 
                    yAxisId="left"
                    dataKey="focusTime" 
                    name="Focus Time" 
                    fill="#a855f7" 
                    radius={[6, 6, 0, 0]} 
                    barSize={20}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="distractionTime" 
                    name="Distraction Time" 
                    fill="#ef4444" 
                    radius={[6, 6, 0, 0]} 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Completion Rate */}
          <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-center relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
            
            <div className="text-center relative z-10 w-full">
              <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                 <Activity className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-white/70 mb-2">Average Completion Rate</h3>
              <div className="text-5xl font-light text-white tracking-tight flex items-baseline justify-center gap-1">
                {reports.length > 0 
                  ? Math.round(reports.reduce((acc, r) => acc + r.taskCompletionRate, 0) / reports.length) 
                  : 0}
                <span className="text-2xl text-white/40">%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full mt-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                  style={{ width: `${reports.length > 0 ? (reports.reduce((acc, r) => acc + r.taskCompletionRate, 0) / reports.length) : 0}%` }}
                />
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
