import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AgendaPanel } from "./AgendaPanel";
import { NewsPanel } from "./NewsPanel";
import { BudgetPanel } from "./BudgetPanel";
import { AIAssistant } from "./AIAssistant";
import { PublicSentimentPanel } from "./PublicSentimentPanel";
import { UserProfilePanel } from "./UserProfilePanel";
import { ProjectsPanel } from "./ProjectsPanel";
import { IndicesPanel } from "./IndicesPanel";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2">Government Simulation Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your digital nation and track key performance indicators
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* First Row - Main Panels */}
          <div className="lg:col-span-2 xl:col-span-2">
            <AgendaPanel />
          </div>
          
          <div className="lg:col-span-1 xl:col-span-1">
            <NewsPanel />
          </div>
          
          <div className="lg:col-span-1 xl:col-span-1">
            <BudgetPanel />
          </div>
          
          {/* Second Row */}
          <div className="lg:col-span-1 xl:col-span-1">
            <AIAssistant />
          </div>
          
          <div className="lg:col-span-2 xl:col-span-2">
            <PublicSentimentPanel />
          </div>
          
          <div className="lg:col-span-1 xl:col-span-1">
            <UserProfilePanel />
          </div>
          
          {/* Third Row */}
          <div className="lg:col-span-2 xl:col-span-2">
            <ProjectsPanel />
          </div>
          
          <div className="lg:col-span-2 xl:col-span-2">
            <IndicesPanel />
          </div>
        </div>
      </div>
    </div>
  );
}