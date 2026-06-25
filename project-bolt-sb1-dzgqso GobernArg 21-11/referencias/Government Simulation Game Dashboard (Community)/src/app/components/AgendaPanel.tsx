import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export function AgendaPanel() {
  const agendaItems = [
    {
      id: 1,
      title: "Healthcare Infrastructure Expansion",
      description: "Build 5 new hospitals in rural areas",
      priority: "high",
      status: "in-progress",
      deadline: "Q3 2025"
    },
    {
      id: 2,
      title: "Education Reform Initiative",
      description: "Modernize curriculum and improve teacher training",
      priority: "medium",
      status: "planning",
      deadline: "Q4 2025"
    },
    {
      id: 3,
      title: "Economic Stimulus Package",
      description: "Reduce unemployment by 15% through job creation programs",
      priority: "high",
      status: "completed",
      deadline: "Q2 2025"
    },
    {
      id: 4,
      title: "Environmental Protection Act",
      description: "Implement renewable energy targets and carbon reduction",
      priority: "medium",
      status: "in-progress",
      deadline: "Q1 2026"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "planning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Current Agenda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agendaItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <h4 className="font-medium">{item.title}</h4>
              </div>
              <Badge className={getPriorityColor(item.priority)} variant="secondary">
                {item.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">{item.status.replace('-', ' ')}</span>
              <span>Due: {item.deadline}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}