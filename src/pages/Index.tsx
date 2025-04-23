
import { PlannerProvider } from "@/context/PlannerContext";
import DailyPlannerLayout from "@/components/DailyPlannerLayout";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PlannerProvider>
        <DailyPlannerLayout />
      </PlannerProvider>
    </div>
  );
};

export default Index;
