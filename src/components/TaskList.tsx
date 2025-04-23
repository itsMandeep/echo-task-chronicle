import { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import TaskItem from './TaskItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ListTodo, Plus, ArrowUpDown, Clock } from 'lucide-react';

type SortType = 'priority' | 'startTime' | 'endTime' | 'none';

export default function TaskList() {
  const { currentPlan, isEditMode, addTask, reorderTasks } = usePlanner();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [sortType, setSortType] = useState<SortType>('none');
  const [newTask, setNewTask] = useState({
    title: '',
    startTime: '',
    endTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isCompleted: false,
    progress: 0
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = currentPlan!.tasks.findIndex((task) => task.id === active.id);
      const newIndex = currentPlan!.tasks.findIndex((task) => task.id === over.id);
      
      const newTasks = arrayMove(currentPlan!.tasks, oldIndex, newIndex);
      reorderTasks(newTasks);
    }
  };

  const sortTasks = (tasks: typeof currentPlan.tasks) => {
    if (!tasks) return [];
    
    let sortedTasks = [...tasks];
    
    switch (sortType) {
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      }
      case 'startTime':
        sortedTasks.sort((a, b) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });
        break;
      case 'endTime':
        sortedTasks.sort((a, b) => {
          if (!a.endTime) return 1;
          if (!b.endTime) return -1;
          return a.endTime.localeCompare(b.endTime);
        });
        break;
      default:
        // Keep original order
        break;
    }

    // Always show incomplete tasks first within the sort
    return sortedTasks.sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask(newTask);
      setNewTask({
        title: '',
        startTime: '',
        endTime: '',
        priority: 'medium',
        isCompleted: false,
        progress: 0
      });
      setIsAddingTask(false);
    }
  };

  const getIncompleteTaskCount = () => {
    return currentPlan?.tasks.filter(task => !task.isCompleted).length || 0;
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ListTodo className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-medium">Tasks</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Original order
                </div>
              </SelectItem>
              <SelectItem value="priority">
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  By priority
                </div>
              </SelectItem>
              <SelectItem value="startTime">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  By start time
                </div>
              </SelectItem>
              <SelectItem value="endTime">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  By end time
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">
            {getIncompleteTaskCount()}/{currentPlan?.tasks.length || 0} remaining
          </span>
          {isEditMode && (
            <Button size="sm" onClick={() => setIsAddingTask(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-2">
        {currentPlan?.tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No tasks yet. {isEditMode ? "Click 'Add Task' to create one." : ""}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentPlan?.tasks || []}
              strategy={verticalListSortingStrategy}
            >
              {sortTasks(currentPlan?.tasks).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask({...newTask, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask({...newTask, endTime: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={newTask.priority} 
                onValueChange={(value) => setNewTask({
                  ...newTask, 
                  priority: value as 'low' | 'medium' | 'high'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTask(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
