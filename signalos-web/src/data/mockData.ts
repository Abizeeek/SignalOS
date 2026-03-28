import type { Task, Insight, KPIMetrics, Session } from '../types';

export const mockTasks: Task[] = [
  {
    id: 't1',
    name: 'Architect Core Engine Rebuild',
    category: 'Engineering',
    signalType: 'SIGNAL',
    leverageType: 'HIGH',
    taskNature: 'DEEP_WORK',
    priority: 'URGENT',
    tags: ['Architecture', 'Backend'],
    estimatedDuration: 120,
    completed: false,
    order: 0,
  },
  {
    id: 't2',
    name: 'Review Q3 Strategy Docs',
    category: 'Planning',
    signalType: 'SIGNAL',
    leverageType: 'MEDIUM',
    taskNature: 'DEEP_WORK',
    priority: 'HIGH',
    tags: ['Strategy'],
    estimatedDuration: 60,
    completed: false,
    order: 1,
  },
  {
    id: 't3',
    name: 'Reply to Investor Emails',
    category: 'Admin',
    signalType: 'NEUTRAL',
    leverageType: 'LOW',
    taskNature: 'COMMUNICATION',
    priority: 'NORMAL',
    tags: ['Email'],
    estimatedDuration: 30,
    completed: false,
    order: 2,
  },
  {
    id: 't4',
    name: 'Team Sync & Status Updates',
    category: 'Management',
    signalType: 'NOISE',
    leverageType: 'LOW',
    taskNature: 'SHALLOW_WORK',
    priority: 'LOW',
    tags: ['Meetings'],
    estimatedDuration: 45,
    completed: false,
    order: 3,
  }
];

export const mockInsights: Insight[] = [
  {
    id: 'i1',
    message: 'Your best signal window is 9:30 AM to 11:30 AM based on your past deep work sessions.',
    severity: 'SUCCESS',
    type: 'SCHEDULE_OPTIMIZATION',
  },
  {
    id: 'i2',
    message: 'You switched tasks too often after lunch, increasing attention residue.',
    severity: 'WARNING',
    type: 'FOCUS_QUALITY',
  },
  {
    id: 'i3',
    message: 'Monk mode improved deep work efficiency by 18% this week.',
    severity: 'INFO',
    type: 'MODE_ANALYSIS',
  }
];

export const mockKPIs: KPIMetrics = {
  snr: 4.2,
  leverageScore: 85,
  priorityIntegrity: 92,
  deepWorkIndex: 78,
  effectiveFocusTime: 4.5,
  attentionResidue: 12,
  decisionFatigue: 45,
};

export const mockSessions: Session[] = [
  {
    id: 's1',
    taskId: 't1',
    taskName: 'Architect Core Engine Rebuild',
    startTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    duration: 90,
    distractions: 1,
  }
];
