
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
import { ListTodo, Plus } from 'lucide-react';

export default function TaskList() {
  const { currentPlan, isEditMode, addTask } = usePlanner();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    startTime: '',
    endTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isCompleted: false,
    progress: 0
  });

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
          <>
            {/* Show incomplete tasks first */}
            {currentPlan?.tasks
              .filter(task => !task.isCompleted)
              .sort((a, b) => {
                // Sort by priority (high -> medium -> low)
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            
            {/* Then show completed tasks */}
            {currentPlan?.tasks
              .filter(task => task.isCompleted)
              .map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
          </>
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
