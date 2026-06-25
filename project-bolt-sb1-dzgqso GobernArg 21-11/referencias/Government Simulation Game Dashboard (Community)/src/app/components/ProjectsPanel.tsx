import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CalendarDays, DollarSign, Users, MapPin, Clock, AlertTriangle } from "lucide-react";

export function ProjectsPanel() {
  const projects = [
    {
      id: 1,
      name: "Metro Line Extension",
      description: "Expanding subway system to serve 3 new districts",
      category: "Infrastructure",
      progress: 75,
      budget: 2500000000,
      spent: 1875000000,
      deadline: "Dec 2025",
      status: "on-track",
      location: "Central District",
      team: 450,
      milestones: [
        { name: "Environmental Impact Study", completed: true },
        { name: "Construction Permits", completed: true },
        { name: "Track Installation", completed: false, current: true },
        { name: "Station Construction", completed: false },
        { name: "Testing & Commissioning", completed: false }
      ]
    },
    {
      id: 2,
      name: "Digital Education Platform",
      description: "Online learning system for all public schools",
      category: "Education",
      progress: 45,
      budget: 150000000,
      spent: 67500000,
      deadline: "Mar 2026",
      status: "delayed",
      location: "Nationwide",
      team: 85,
      milestones: [
        { name: "Platform Development", completed: true },
        { name: "Content Creation", completed: false, current: true },
        { name: "Teacher Training", completed: false },
        { name: "School Deployment", completed: false },
        { name: "Performance Evaluation", completed: false }
      ]
    },
    {
      id: 3,
      name: "Green Energy Initiative",
      description: "Installing solar panels on government buildings",
      category: "Environment",
      progress: 90,
      budget: 800000000,
      spent: 720000000,
      deadline: "Oct 2025",
      status: "ahead",
      location: "Multiple Sites",
      team: 320,
      milestones: [
        { name: "Site Assessment", completed: true },
        { name: "Equipment Procurement", completed: true },
        { name: "Installation Phase 1", completed: true },
        { name: "Installation Phase 2", completed: false, current: true },
        { name: "Grid Integration", completed: false }
      ]
    },
    {
      id: 4,
      name: "Hospital Modernization",
      description: "Upgrading medical equipment in 12 regional hospitals",
      category: "Healthcare",
      progress: 60,
      budget: 1200000000,
      spent: 720000000,
      deadline: "Jun 2026",
      status: "on-track",
      location: "Regional Hospitals",
      team: 200,
      milestones: [
        { name: "Equipment Procurement", completed: true },
        { name: "Staff Training", completed: true },
        { name: "Installation & Setup", completed: false, current: true },
        { name: "System Testing", completed: false },
        { name: "Final Certification", completed: false }
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "ahead":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delayed":
        return <AlertTriangle className="w-4 h-4" />;
      case "ahead":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Infrastructure":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Education":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Environment":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Healthcare":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ongoing Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 space-y-4">
            {/* Project Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getCategoryColor(project.category)}>
                    {project.category}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                  <div className="font-medium">{formatCurrency(project.budget)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Deadline</div>
                  <div className="font-medium">{project.deadline}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Team Size</div>
                  <div className="font-medium">{project.team} people</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="font-medium">{project.location}</div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Milestones:</span>
              <div className="space-y-1">
                {project.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      milestone.completed ? 'bg-green-500 border-green-500' :
                      milestone.current ? 'bg-blue-500 border-blue-500' :
                      'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                    }`} />
                    <span className={`${
                      milestone.completed ? 'text-green-600 line-through' :
                      milestone.current ? 'text-blue-600 font-medium' :
                      'text-muted-foreground'
                    }`}>
                      {milestone.name}
                    </span>
                    {milestone.current && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" className="flex-1">
                View Details
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Update Status
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}