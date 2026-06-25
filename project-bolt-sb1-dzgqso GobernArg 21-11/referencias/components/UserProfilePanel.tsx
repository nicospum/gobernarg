import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, User, Crown, Trophy, Star } from "lucide-react";

export function UserProfilePanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const topPlayers = [
    {
      id: 1,
      name: "Alexandra Chen",
      country: "New Singapore",
      rank: 1,
      score: 89,
      avatar: null,
      achievements: ["Economic Innovator", "Green Leader", "Social Reformer"],
      specialties: ["Technology Policy", "Environmental Protection"]
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      country: "Federation of Sol",
      rank: 2,
      score: 85,
      avatar: null,
      achievements: ["Defense Strategist", "Trade Master"],
      specialties: ["Military Strategy", "International Trade"]
    },
    {
      id: 3,
      name: "Your Nation",
      country: "Democratic Republic",
      rank: 3,
      score: 78,
      avatar: null,
      achievements: ["Rising Star", "People's Choice"],
      specialties: ["Healthcare Reform", "Education"]
    },
    {
      id: 4,
      name: "Elena Volkov",
      country: "Northern Alliance",
      rank: 4,
      score: 76,
      avatar: null,
      achievements: ["Infrastructure Builder"],
      specialties: ["Transportation", "Urban Planning"]
    },
    {
      id: 5,
      name: "David Kim",
      country: "East Pacific Union",
      rank: 5,
      score: 74,
      avatar: null,
      achievements: ["Diplomatic Ace"],
      specialties: ["Foreign Relations", "Cultural Exchange"]
    }
  ];

  const handleProfileSelect = (profile: any) => {
    setSelectedProfile(profile);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Trophy className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Star className="w-4 h-4 text-amber-600" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leader Profiles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search leaders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected Profile Detail */}
        {selectedProfile && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedProfile.avatar} />
                <AvatarFallback>
                  {selectedProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getRankIcon(selectedProfile.rank)}
                  <h4 className="font-medium">{selectedProfile.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{selectedProfile.country}</p>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getScoreColor(selectedProfile.score)}`}>
                  {selectedProfile.score}%
                </div>
                <div className="text-xs text-muted-foreground">Rank #{selectedProfile.rank}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium">Achievements:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProfile.achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium">Specialties:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProfile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                View Full Profile
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Send Message
              </Button>
            </div>
          </div>
        )}

        {/* Top Players List */}
        <div className="space-y-2">
          <h4 className="font-medium">Global Leaderboard</h4>
          <div className="space-y-1">
            {topPlayers.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedProfile?.id === player.id ? "bg-muted" : ""
                }`}
                onClick={() => handleProfileSelect(player)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {getRankIcon(player.rank)}
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{player.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{player.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getScoreColor(player.score)}`}>
                    {player.score}%
                  </div>
                  <div className="text-xs text-muted-foreground">#{player.rank}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}