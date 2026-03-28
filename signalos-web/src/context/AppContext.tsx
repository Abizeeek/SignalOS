import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, Mode, Session, Insight, KPIMetrics } from '../types';

interface AppContextProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  insights: Insight[];
  kpis: KPIMetrics;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  activeSession: Session | null;
  setActiveSession: React.Dispatch<React.SetStateAction<Session | null>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  addTask: (task: Omit<Task, 'id' | 'order'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  
  // Default fallback KPIs while loading
  const [kpis, setKpis] = useState<KPIMetrics>({
    snr: 0, leverageScore: 0, priorityIntegrity: 0, deepWorkIndex: 0,
    effectiveFocusTime: 0, attentionResidue: 0, decisionFatigue: 0
  });
  
  const [mode, setMode] = useState<Mode>('FOUNDER');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:8080/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, sessionsRes, kpisRes, insightsRes] = await Promise.all([
          fetch(`${API_BASE}/tasks`),
          fetch(`${API_BASE}/sessions`),
          fetch(`${API_BASE}/kpis`),
          fetch(`${API_BASE}/insights`)
        ]);

        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (sessionsRes.ok) setSessions(await sessionsRes.json());
        if (kpisRes.ok) setKpis(await kpisRes.json());
        if (insightsRes.ok) setInsights(await insightsRes.json());
      } catch (e) {
        console.error("Failed to connect to SignalOS Java API:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const addTask = async (taskData: Omit<Task, 'id' | 'order'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
    
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    const result = Array.from(tasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const reordered = result.map((t, index) => ({ ...t, order: index }));
    setTasks(reordered);
  };

  return (
    <AppContext.Provider value={{
      tasks, setTasks,
      sessions, setSessions,
      insights, kpis,
      mode, setMode,
      activeSession, setActiveSession,
      activeTab, setActiveTab,
      addTask, updateTask, deleteTask, reorderTasks,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
