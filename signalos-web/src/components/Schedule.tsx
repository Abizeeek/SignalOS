import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Type, AlignLeft, Plus, X } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
}

export function Schedule() {
  const { tasks } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New event form state
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // For simplicity, we can fetch for the whole month or just as we view. 
      // Current API takes a specific date. Let's fetch for the selected date if modal is open, 
      // or we can fetch all and filter client side. 
      // Actually, let's just fetch all tasks (already in context) and for events, we'll fetch them.
      const res = await fetchWithAuth(`/events?date=${selectedDate}`);
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch events", e);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDayFormat = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Calculate total cells needed to maintain a complete grid (multiple of 7 columns)
  const totalCells = blanks.length + days.length;
  const trailingBlanksCount = Math.ceil(totalCells / 7) * 7 - totalCells;
  const trailingBlanks = Array.from({ length: trailingBlanksCount }, (_, i) => i);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth('/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          eventDate: selectedDate,
          eventTime: time + ":00" // SQL Time format
        })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setIsModalOpen(false);
        fetchEvents();
      }
    } catch (e) {
      console.error("Failed to add event", e);
    } finally {
      setLoading(false);
    }
  };

  const openAddEvent = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Schedule</h1>
          <p className="text-slate-400">Organize your master plan</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300">
            <ChevronLeft size={20} />
          </button>
          <div className="w-40 text-center font-medium text-lg text-indigo-100 flex items-center justify-center gap-2">
            <CalendarIcon size={18} className="text-indigo-400"/>
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border-white/10 overflow-hidden flex flex-col">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-slate-900/40">
          {daysOfWeek.map(day => (
            <div key={day} className="py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-900/20">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="border-b border-r border-white/5 p-2 bg-slate-900/10 min-h-[100px]"></div>
          ))}
          {days.map(day => {
            const dateStr = getDayFormat(day);
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div key={day} className="border-b border-r border-white/5 p-2 min-h-[100px] flex flex-col group hover:bg-white/[0.02] transition-colors relative">
                <div className={`text-sm font-medium mb-2 inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {day}
                </div>
                <button 
                  onClick={() => openAddEvent(dateStr)}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus size={14} />
                </button>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                  {dayTasks.map(t => (
                    <div key={t.id} className="flex flex-col text-[10px] p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 cursor-default group/task hover:bg-indigo-500/20 transition-colors">
                       <div className="flex items-center truncate">
                         <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${t.completed ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.5)]'}`}></span>
                         {t.dueTime && <span className="opacity-70 mr-1.5 flex-shrink-0">{t.dueTime}</span>}
                         <span className="truncate font-medium flex-1">{t.name}</span>
                       </div>
                    </div>
                  ))}
                  {/* Show events if they match this date. In a real app we'd fetch all events for the month. */}
                  {events.filter(e => e.eventDate === dateStr).map(e => (
                    <div key={e.id} className="flex flex-col text-[10px] p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 cursor-default">
                       <div className="flex items-center truncate">
                         <Clock size={10} className="mr-1.5 text-emerald-400" />
                         <span className="opacity-70 mr-1.5 flex-shrink-0">{e.eventTime.substring(0, 5)}</span>
                         <span className="truncate font-medium flex-1">{e.title}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {trailingBlanks.map(b => (
             <div key={`trail-${b}`} className="border-b border-r border-white/5 p-2 bg-slate-900/10 min-h-[100px]"></div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-indigo-400" size={24} />
              Add Event
            </h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Event Title</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="E.g., Viva Session, Project Meeting"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                  <input
                    type="date"
                    disabled
                    value={selectedDate}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description (Optional)</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-500" size={18} />
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add details about the event..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium h-24 resize-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !title}
                className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    Initialize Event Protocol
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
