import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { GripVertical, Plus, Play, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { TaskModal } from './TaskModal';

export function TaskPlanner() {
  const { tasks, reorderTasks, setActiveSession, activeSession } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderTasks(result.source.index, result.destination.index);
  };

  const openNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const startSession = (task: Task) => {
    if (activeSession) return; // Prevent multiple sessions
    setActiveSession({
      id: `s_${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      startTime: new Date().toISOString(),
      duration: 0,
      distractions: 0
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-slate-200">Priority Planner</h3>
          <p className="text-xs text-slate-400 mt-1">Drag to reorder your daily leverage stack</p>
        </div>
        <button
          onClick={openNewTask}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 space-y-3 min-h-[100px]"
            >
              {tasks.sort((a, b) => a.order - b.order).map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={clsx(
                        "group flex items-center gap-4 p-4 rounded-2xl border transition-all glass-panel",
                        snapshot.isDragging ? "shadow-[0_0_30px_rgba(99,102,241,0.15)] border-indigo-500/50 scale-[1.01] bg-slate-900/80 z-50" : "border-white/5 hover:bg-white/5 bg-slate-900/30"
                      )}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0 cursor-pointer" onDoubleClick={() => openEditTask(task)}>
                        <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">{task.name}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] uppercase tracking-wider font-bold">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-white bg-opacity-20",
                            task.signalType === 'SIGNAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                            task.signalType === 'NOISE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                          )}>
                            {task.signalType}
                          </span>
                          <span className={clsx(
                            task.leverageType === 'HIGH' ? 'text-indigo-400' :
                            task.leverageType === 'MEDIUM' ? 'text-blue-400' : 'text-slate-500'
                          )}>
                            {task.leverageType} LVG
                          </span>
                          <span className="text-slate-500">{task.estimatedDuration}m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startSession(task)}
                          disabled={!!activeSession}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          title="Start Focus Session"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                        <button 
                          onClick={() => openEditTask(task)}
                          className="p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
