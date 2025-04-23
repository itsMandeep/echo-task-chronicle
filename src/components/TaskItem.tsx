
import { useState } from 'react';
import { Task } from '@/types';
import { usePlanner } from '@/context/PlannerContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash, Clock, AlertTriangle, PenLine, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { isEditMode, updateTask, deleteTask } = usePlanner();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    title: task.title,
    startTime: task.startTime,
    endTime: task.endTime,
    priority: task.priority,
  });

  const handleProgressChange = (value: number) => {
    updateTask(task.id, { 
      progress: value,
      isCompleted: value === 100
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    updateTask(task.id, { 
      isCompleted: checked,
      progress: checked ? 100 : task.progress
    });
  };

  const handleEditSave = () => {
    updateTask(task.id, editedTask);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'medium':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'low':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-3 rounded-lg border mb-2 ${task.isCompleted ? 'bg-gray-50 opacity-80' : 'bg-white'}`}>
      <div className="flex items-start gap-2">
        <div className="pt-0.5">
          <Checkbox 
            checked={task.isCompleted} 
            onCheckedChange={handleCheckboxChange}
            disabled={!isEditMode && !task.isCompleted}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
              {task.spilledFrom && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (Spilled from {format(parseISO(task.spilledFrom), "MMM d")})
                </span>
              )}
            </h3>
            <div className="flex gap-1">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                {task.priority}
              </span>
              {isEditMode && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setIsEditing(true)}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-red-500" 
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {(task.startTime || task.endTime) && (
            <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
              <Clock className="h-3 w-3" />
              {task.startTime && (
                <span>{task.startTime}</span>
              )}
              {task.startTime && task.endTime && (
                <span>-</span>
              )}
              {task.endTime && (
                <span>{task.endTime}</span>
              )}
            </div>
          )}
          
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Progress value={task.progress} className="h-2 flex-1" />
              <span className="text-xs text-gray-500">{task.progress}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={editedTask.startTime || ''}
                  onChange={(e) => setEditedTask({...editedTask, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={editedTask.endTime || ''}
                  onChange={(e) => setEditedTask({...editedTask, endTime: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={editedTask.priority} 
                onValueChange={(value) => setEditedTask({...editedTask, priority: value as 'low' | 'medium' | 'high'})}
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
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
