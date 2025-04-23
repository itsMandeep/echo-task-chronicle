import { createContext, useContext, useEffect, useState } from "react";
import { DailyPlan, Task, Note } from "@/types";
import { format } from "date-fns";

interface PlannerContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentPlan: DailyPlan | null;
  isEditMode: boolean;
  toggleEditMode: () => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addNote: (content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  setPlanName: (name: string) => void;
  checkForPreviousTasks: () => { hasPrevious: boolean; previousDate: string | null };
  importPreviousTasks: () => void;
  reorderTasks: (tasks: Task[]) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState<Record<string, DailyPlan>>({});
  const [isEditMode, setIsEditMode] = useState(true);

  const dateKey = format(currentDate, "yyyy-MM-dd");
  
  const currentPlan = plans[dateKey] || null;

  useEffect(() => {
    const savedPlans = localStorage.getItem("dailyPlans");
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(plans).length > 0) {
      localStorage.setItem("dailyPlans", JSON.stringify(plans));
    }
  }, [plans]);

  useEffect(() => {
    if (!plans[dateKey]) {
      setPlans(prev => ({
        ...prev,
        [dateKey]: {
          date: dateKey,
          tasks: [],
          notes: [],
          lastUpdated: new Date().toISOString()
        }
      }));
    }
  }, [dateKey, plans]);

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const now = new Date();
    const currentDate = new Date(dateKey);
    
    // Set default times if not provided
    const startTime = task.startTime || format(now, 'HH:mm');
    const endTime = task.endTime || '23:59';
    
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      startTime,
      endTime,
      repeatPattern: task.repeatPattern || 'none'
    };

    setPlans(prev => {
      const updatedPlans = { ...prev };
      
      // Add task to current date
      updatedPlans[dateKey] = {
        ...prev[dateKey],
        tasks: [...(prev[dateKey]?.tasks || []), newTask],
        lastUpdated: new Date().toISOString()
      };

      // If task is repeating, add future instances
      if (newTask.repeatPattern !== 'none') {
        let nextDate = new Date(currentDate);
        for (let i = 0; i < 12; i++) { // Create next 12 instances
          switch (newTask.repeatPattern) {
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'fortnightly':
              nextDate.setDate(nextDate.getDate() + 14);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
          }

          const nextDateKey = format(nextDate, 'yyyy-MM-dd');
          
          // Create future task instance
          const futureTask: Task = {
            ...newTask,
            id: crypto.randomUUID(),
            createdAt: newTask.createdAt // Keep original creation date
          };

          updatedPlans[nextDateKey] = {
            ...prev[nextDateKey],
            date: nextDateKey,
            tasks: [...(prev[nextDateKey]?.tasks || []), futureTask],
            notes: [...(prev[nextDateKey]?.notes || [])],
            lastUpdated: new Date().toISOString()
          };
        }
      }

      return updatedPlans;
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setPlans(prev => {
      const currentTasks = prev[dateKey]?.tasks || [];
      const taskToUpdate = currentTasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) return prev;

      const updatedTasks = currentTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              ...updates,
              endTime: updates.endTime || task.endTime || '23:59'
            }
          : task
      );

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          tasks: updatedTasks,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };

  const deleteTask = (taskId: string) => {
    if (!isEditMode) return;
    
    setPlans(prev => {
      const currentTasks = prev[dateKey]?.tasks || [];
      const filteredTasks = currentTasks.filter(task => task.id !== taskId);

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          tasks: filteredTasks,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };

  const addNote = (content: string) => {
    if (!isEditMode) return;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString()
    };

    setPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        notes: [...(prev[dateKey]?.notes || []), newNote],
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const updateNote = (noteId: string, content: string) => {
    if (!isEditMode) return;
    
    setPlans(prev => {
      const currentNotes = prev[dateKey]?.notes || [];
      const updatedNotes = currentNotes.map(note => 
        note.id === noteId ? { ...note, content } : note
      );

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          notes: updatedNotes,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };

  const deleteNote = (noteId: string) => {
    if (!isEditMode) return;
    
    setPlans(prev => {
      const currentNotes = prev[dateKey]?.notes || [];
      const filteredNotes = currentNotes.filter(note => note.id !== noteId);

      return {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          notes: filteredNotes,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };

  const setPlanName = (name: string) => {
    if (!isEditMode) return;
    
    setPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        name,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const checkForPreviousTasks = () => {
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = format(yesterday, "yyyy-MM-dd");
    
    const previousPlan = plans[yesterdayKey];
    
    if (previousPlan) {
      const incompleteTasks = previousPlan.tasks.filter(task => !task.isCompleted);
      return { 
        hasPrevious: incompleteTasks.length > 0, 
        previousDate: yesterdayKey 
      };
    }
    
    return { hasPrevious: false, previousDate: null };
  };

  const importPreviousTasks = () => {
    if (!isEditMode) return;
    
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = format(yesterday, "yyyy-MM-dd");
    
    const previousPlan = plans[yesterdayKey];
    
    if (previousPlan) {
      const incompleteTasks = previousPlan.tasks
        .filter(task => !task.isCompleted)
        .map(task => ({
          ...task,
          id: crypto.randomUUID(),
          spilledFrom: yesterdayKey
        }));

      if (incompleteTasks.length > 0) {
        setPlans(prev => ({
          ...prev,
          [dateKey]: {
            ...prev[dateKey],
            tasks: [...(prev[dateKey]?.tasks || []), ...incompleteTasks],
            lastUpdated: new Date().toISOString()
          }
        }));
      }
    }
  };

  const reorderTasks = (tasks: Task[]) => {
    setPlans(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        tasks,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  return (
    <PlannerContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        currentPlan,
        isEditMode,
        toggleEditMode,
        addTask,
        updateTask,
        deleteTask,
        addNote,
        updateNote,
        deleteNote,
        setPlanName,
        checkForPreviousTasks,
        importPreviousTasks,
        reorderTasks
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error("usePlanner must be used within a PlannerProvider");
  }
  return context;
}
