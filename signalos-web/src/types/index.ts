export type SignalType = 'SIGNAL' | 'NOISE' | 'NEUTRAL';
export type LeverageType = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskNature = 'DEEP_WORK' | 'SHALLOW_WORK' | 'ADMIN' | 'COMMUNICATION';
export type Mode = 'FOUNDER' | 'OPERATOR' | 'MONK';
export type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export interface Task {
  id: string;
  name: string;
  category: string;
  signalType: SignalType;
  leverageType: LeverageType;
  taskNature: TaskNature;
  priority: Priority;
  tags: string[];
  estimatedDuration: number; // in minutes
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  description?: string;
  order: number;
}

export interface Session {
  id: string;
  taskId: string;
  taskName: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  distractions: number;
}

export interface Insight {
  id: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'SUCCESS';
  type: string;
}

export interface DistractionLog {
  id: string;
  source: string;
  durationMinutes: number;
  timestamp: string;
}

export interface KPIMetrics {
  snr: number;
  leverageScore: number;
  priorityIntegrity: number;
  deepWorkIndex: number;
  effectiveFocusTime: number; // in hours
  attentionResidue: number;
  decisionFatigue: number;
  screenTime?: number;
  distractionTime?: number;
  productiveTime?: number;
  productivityScore?: number;
  taskCompletionRate?: number;
}

export interface DailyReport {
  date: string;
  productivityScore: number;
  focusTime: number;
  distractionTime: number;
  taskCompletionRate: number;
}

export type BossLevel = 'NONE' | 'MINI_BOSS' | 'FINAL_BOSS';
export type WarStatus = 'ONGOING' | 'VICTORY' | 'DEFEATED';

export interface FocusWarSession {
  id: string;
  userId: string;
  sessionDate: string;
  focusHP: number;
  distractionCount: number;
  xpEarned: number;
  bossLevel: BossLevel;
  warStatus: WarStatus;
  createdAt: string;
  updatedAt: string;
}

