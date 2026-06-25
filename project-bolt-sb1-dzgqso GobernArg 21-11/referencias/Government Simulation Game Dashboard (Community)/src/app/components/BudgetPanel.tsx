import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function BudgetPanel() {
  const budgetData = {
    totalBudget: 125000000000,
    totalSpent: 78500000000,
    revenue: 142000000000,
    surplus: 17000000000
  };

  const spendingCategories = [
    { name: "Healthcare", amount: 25000000000, percentage: 31.8, color: "bg-blue-500" },
    { name: "Education", amount: 20000000000, percentage: 25.5, color: "bg-green-500" },
    { name: "Defense", amount: 15000000000, percentage: 19.1, color: "bg-red-500" },
    { name: "Infrastructure", amount: 12000000000, percentage: 15.3, color: "bg-yellow-500" },
    { name: "Social Services", amount: 6500000000, percentage: 8.3, color: "bg-purple-500" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const spentPercentage = (budgetData.totalSpent / budgetData.totalBudget) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>National Budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm">Total Revenue</span>
            </div>
            <span className="font-medium">{formatCurrency(budgetData.revenue)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Budget Allocated</span>
            </div>
            <span className="font-medium">{formatCurrency(budgetData.totalBudget)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm">Total Spent</span>
            </div>
            <span className="font-medium">{formatCurrency(budgetData.totalSpent)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={spentPercentage} className="h-2" />
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Spending by Category</h4>
          {spendingCategories.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{category.name}</span>
                <span>{formatCurrency(category.amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {category.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Surplus/Deficit */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm">Budget Surplus</span>
            <span className="font-medium text-green-600">
              {formatCurrency(budgetData.surplus)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}