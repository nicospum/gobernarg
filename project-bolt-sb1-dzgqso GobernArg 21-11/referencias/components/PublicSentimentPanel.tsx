import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Users, Star, Medal } from "lucide-react";

export function PublicSentimentPanel() {
  const sentimentData = {
    overallRating: 72,
    approval: 68,
    disapproval: 22,
    neutral: 10,
    ranking: 3,
    totalLeaders: 15,
    trend: "up",
    trendValue: 5
  };

  const sentimentBreakdown = [
    { category: "Economic Policy", score: 78, trend: "up", change: 8 },
    { category: "Healthcare", score: 71, trend: "up", change: 3 },
    { category: "Education", score: 69, trend: "down", change: -2 },
    { category: "Environment", score: 65, trend: "up", change: 12 },
    { category: "Security", score: 74, trend: "up", change: 1 }
  ];

  const recentEvents = [
    { event: "Economic Stimulus Package", impact: "+8", sentiment: "positive" },
    { event: "Healthcare Reform", impact: "+5", sentiment: "positive" },
    { event: "Tax Policy Change", impact: "-3", sentiment: "negative" },
    { event: "Infrastructure Investment", impact: "+6", sentiment: "positive" }
  ];

  const getRankingIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank <= 3) return <Star className="w-5 h-5 text-blue-500" />;
    return <Users className="w-5 h-5 text-gray-500" />;
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      case "negative":
        return "text-red-600 bg-red-50 dark:bg-red-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Public Sentiment & Ranking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {getRankingIcon(sentimentData.ranking)}
            <span className="text-2xl font-bold">{sentimentData.overallRating}%</span>
            <div className="flex items-center gap-1">
              {getTrendIcon(sentimentData.trend)}
              <span className={`text-sm ${sentimentData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {sentimentData.trendValue}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ranked #{sentimentData.ranking} of {sentimentData.totalLeaders} leaders
          </p>
        </div>

        {/* Approval Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Approval Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Approval</span>
              <span className="text-green-600">{sentimentData.approval}%</span>
            </div>
            <Progress value={sentimentData.approval} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Disapproval</span>
              <span className="text-red-600">{sentimentData.disapproval}%</span>
            </div>
            <Progress value={sentimentData.disapproval} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Neutral</span>
              <span className="text-gray-600">{sentimentData.neutral}%</span>
            </div>
            <Progress value={sentimentData.neutral} className="h-2" />
          </div>
        </div>

        {/* Policy Sentiment */}
        <div className="space-y-3">
          <h4 className="font-medium">Policy Sentiment</h4>
          <div className="space-y-2">
            {sentimentBreakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.category}</span>
                  {getTrendIcon(item.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                  <span className="text-sm font-medium w-10 text-right">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Impact Events */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Impact Events</h4>
          <div className="space-y-2">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="flex-1">{event.event}</span>
                <Badge variant="outline" className={getSentimentColor(event.sentiment)}>
                  {event.impact}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}