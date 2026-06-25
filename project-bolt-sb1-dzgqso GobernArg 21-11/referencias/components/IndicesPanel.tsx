import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  Briefcase, 
  Heart, 
  Bed, 
  GraduationCap, 
  Route, 
  Droplets, 
  TrendingUp, 
  DollarSign,
  PiggyBank,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

export function IndicesPanel() {
  const indices = [
    {
      category: "Employment",
      icon: Briefcase,
      metrics: [
        { name: "Total Jobs", value: "2.4M", target: "2.5M", progress: 96, trend: "up", change: "+3.2%" },
        { name: "Unemployment Rate", value: "3.8%", target: "3.5%", progress: 85, trend: "down", change: "-0.4%" }
      ]
    },
    {
      category: "Healthcare",
      icon: Heart,
      metrics: [
        { name: "Hospitals", value: "245", target: "280", progress: 87, trend: "up", change: "+12" },
        { name: "Hospital Beds", value: "45,600", target: "50,000", progress: 91, trend: "up", change: "+2,400" }
      ]
    },
    {
      category: "Education",
      icon: GraduationCap,
      metrics: [
        { name: "Schools", value: "3,420", target: "3,600", progress: 95, trend: "up", change: "+45" },
        { name: "Literacy Rate", value: "96.8%", target: "98%", progress: 99, trend: "up", change: "+0.3%" }
      ]
    },
    {
      category: "Infrastructure",
      icon: Route,
      metrics: [
        { name: "Roads (km)", value: "124,500", target: "130,000", progress: 96, trend: "up", change: "+1,200" },
        { name: "Drainage Coverage", value: "78%", target: "85%", progress: 92, trend: "up", change: "+2.1%" }
      ]
    },
    {
      category: "Economy",
      icon: TrendingUp,
      metrics: [
        { name: "GDP Growth", value: "4.2%", target: "4.5%", progress: 93, trend: "up", change: "+0.8%" },
        { name: "Inflation Rate", value: "2.1%", target: "2.0%", progress: 95, trend: "stable", change: "0%" }
      ]
    },
    {
      category: "Finance",
      icon: DollarSign,
      metrics: [
        { name: "Tax Collection", value: "$142B", target: "$150B", progress: 95, trend: "up", change: "+8.5%" },
        { name: "Revenue", value: "$158B", target: "$165B", progress: 96, trend: "up", change: "+5.2%" },
        { name: "Expenditure", value: "$141B", target: "$150B", progress: 94, trend: "up", change: "+3.1%" }
      ]
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      case "stable":
        return <Minus className="w-3 h-3 text-gray-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 95) return "bg-green-500";
    if (progress >= 85) return "bg-blue-500";
    if (progress >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      "Employment": Briefcase,
      "Healthcare": Heart,
      "Education": GraduationCap,
      "Infrastructure": Route,
      "Economy": TrendingUp,
      "Finance": DollarSign
    };
    return iconMap[category] || TrendingUp;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Key Performance Indices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {indices.map((section) => {
          const IconComponent = section.icon;
          return (
            <div key={section.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <IconComponent className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">{section.category}</h4>
              </div>
              
              <div className="space-y-3 pl-7">
                {section.metrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{metric.value}</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Target: {metric.target}</span>
                        <span>{metric.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.progress)}`}
                          style={{ width: `${metric.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Quick Stats Summary */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Performance Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">8.7/10</div>
              <div className="text-xs text-muted-foreground">Overall Rating</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-xs text-muted-foreground">Target Achievement</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Strong Economy
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Growing Infrastructure
            </Badge>
            <Badge variant="secondary" className="text-xs">
              High Employment
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}