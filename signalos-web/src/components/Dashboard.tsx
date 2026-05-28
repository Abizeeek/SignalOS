import { KPICards } from './KPICards';
import { InsightFeed } from './InsightFeed';
import { SignalChart } from './PlaceholderChart';
import { TaskPlanner } from './TaskPlanner';
import { ScreenTimeChart } from './ScreenTimeChart';
import { DistractionTracker } from './DistractionTracker';

export function Dashboard() {
  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1600px] mx-auto custom-scrollbar">
      <KPICards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px] h-[400px]">
        <div className="lg:col-span-2 h-full">
          <SignalChart />
        </div>
        <div className="h-full">
          <InsightFeed />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[300px] h-[300px] mt-6">
        <div className="lg:col-span-2 h-full">
          <ScreenTimeChart />
        </div>
        <div className="h-full">
          <DistractionTracker />
        </div>
      </div>
      
      <div className="mt-6">
        <TaskPlanner />
      </div>
    </div>
  );
}
