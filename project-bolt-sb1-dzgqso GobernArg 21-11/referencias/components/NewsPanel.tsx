import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { AlertTriangle, TrendingUp, Users, Briefcase } from "lucide-react";

export function NewsPanel() {
  const newsItems = [
    {
      id: 1,
      title: "Economic Growth Reaches 4.2%",
      description: "Quarterly GDP shows strong performance",
      category: "economy",
      time: "2 hours ago",
      severity: "positive"
    },
    {
      id: 2,
      title: "Healthcare Workers Strike",
      description: "Nurses demand better working conditions",
      category: "health",
      time: "4 hours ago",
      severity: "negative"
    },
    {
      id: 3,
      title: "New Education Funding Approved",
      description: "Parliament approves $2B education budget",
      category: "education",
      time: "6 hours ago",
      severity: "positive"
    },
    {
      id: 4,
      title: "Unemployment Rate Drops to 3.8%",
      description: "Job creation programs show results",
      category: "employment",
      time: "8 hours ago",
      severity: "positive"
    },
    {
      id: 5,
      title: "Environmental Protest in Capital",
      description: "Citizens demand faster climate action",
      category: "environment",
      time: "12 hours ago",
      severity: "neutral"
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "economy":
        return <TrendingUp className="w-4 h-4" />;
      case "health":
        return <AlertTriangle className="w-4 h-4" />;
      case "education":
        return <Users className="w-4 h-4" />;
      case "employment":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "positive":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "negative":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "neutral":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Breaking News</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item.id} className={`border rounded-lg p-3 ${getSeverityColor(item.severity)}`}>
                <div className="flex items-start gap-2 mb-2">
                  {getCategoryIcon(item.category)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}