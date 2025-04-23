
import { useEffect, useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Eye } from 'lucide-react';

export default function DailyHeader() {
  const { 
    currentDate, 
    setCurrentDate, 
    currentPlan, 
    isEditMode, 
    toggleEditMode,
    setPlanName,
    checkForPreviousTasks,
    importPreviousTasks
  } = usePlanner();
  
  const [planName, setPlanNameLocal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSpilloverPrompt, setShowSpilloverPrompt] = useState(false);
  
  useEffect(() => {
    if (currentPlan?.name) {
      setPlanNameLocal(currentPlan.name);
    } else {
      setPlanNameLocal('');
    }
  }, [currentPlan?.name]);

  // Show spillover prompt when navigating to today if previous day has incomplete tasks
  useEffect(() => {
    // Only show prompt if we're on today's date and in edit mode
    if (isSameDay(currentDate, new Date()) && isEditMode) {
      const { hasPrevious } = checkForPreviousTasks();
      if (hasPrevious) {
        setShowSpilloverPrompt(true);
      }
    }
  }, [currentDate, isEditMode, checkForPreviousTasks]);

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handleSaveName = () => {
    setPlanName(planName);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevDay}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextDay}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEditMode}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Mode
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={toggleEditMode}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Mode
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        {isEditing ? (
          <div className="flex w-full space-x-2">
            <Input
              value={planName}
              onChange={(e) => setPlanNameLocal(e.target.value)}
              placeholder="Enter plan name (optional)"
              className="flex-1"
            />
            <Button onClick={handleSaveName}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex w-full justify-between items-center">
            <h1 className="text-xl font-semibold">
              {currentPlan?.name || format(currentDate, "EEEE, MMMM d")}
            </h1>
            {isEditMode && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Rename
              </Button>
            )}
          </div>
        )}
      </div>
      
      <AlertDialog open={showSpilloverPrompt} onOpenChange={setShowSpilloverPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Incomplete Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              You have incomplete tasks from yesterday. Would you like to import them to today's plan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No Thanks</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              importPreviousTasks();
              setShowSpilloverPrompt(false);
            }}>
              Yes, Import Tasks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
