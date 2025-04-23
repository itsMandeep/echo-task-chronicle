
import { useEffect } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import DailyHeader from './DailyHeader';
import TaskList from './TaskList';
import NotesSection from './NotesSection';

export default function DailyPlannerLayout() {
  const { currentPlan } = usePlanner();

  // Set up notification for tasks with startTime
  useEffect(() => {
    if (!currentPlan?.tasks) return;

    // Check if browser supports notifications
    if (!("Notification" in window)) return;

    // Check if we have permission for notifications
    if (Notification.permission === "granted") {
      setUpNotifications();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setUpNotifications();
        }
      });
    }

    function setUpNotifications() {
      // Clear any existing notifications
      const existingTimers = JSON.parse(localStorage.getItem('notificationTimers') || '[]');
      existingTimers.forEach((timerId: number) => clearTimeout(timerId));
      
      const newTimers: number[] = [];
      
      // Set up notifications for tasks with start times
      currentPlan.tasks.forEach(task => {
        if (task.startTime && !task.isCompleted) {
          const now = new Date();
          const taskDate = new Date(currentPlan.date);
          
          // Extract hours and minutes from startTime (format: "HH:MM")
          const [hours, minutes] = task.startTime.split(':').map(Number);
          
          taskDate.setHours(hours, minutes, 0, 0);
          
          // Only set notification if the time is in the future
          if (taskDate > now) {
            const timeDiff = taskDate.getTime() - now.getTime();
            
            // Set notification to fire at the start time
            const timerId = window.setTimeout(() => {
              new Notification("Task Reminder", {
                body: `Time to start: ${task.title}`,
                icon: "/favicon.ico"
              });
            }, timeDiff);
            
            newTimers.push(timerId);
          }
        }
      });
      
      // Store new timer IDs
      localStorage.setItem('notificationTimers', JSON.stringify(newTimers));
    }
    
    // Cleanup function
    return () => {
      const existingTimers = JSON.parse(localStorage.getItem('notificationTimers') || '[]');
      existingTimers.forEach((timerId: number) => clearTimeout(timerId));
      localStorage.setItem('notificationTimers', JSON.stringify([]));
    };
  }, [currentPlan]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <DailyHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TaskList />
        </div>
        <div>
          <NotesSection />
        </div>
      </div>
    </div>
  );
}
