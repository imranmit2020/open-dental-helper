import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Trophy, Target, Zap, Users } from "lucide-react";

interface AchievementsBadgesProps {
  achievements: any[];
  yearsOfExperience: number;
  ceProgress: number;
}

export function AchievementsBadges({ achievements, yearsOfExperience, ceProgress }: AchievementsBadgesProps) {
  // Auto-generated achievements based on profile data
  const autoAchievements = [];
  
  if (yearsOfExperience >= 5) {
    autoAchievements.push({
      title: "Veteran Practitioner",
      description: `${Math.floor(yearsOfExperience)} years of professional experience`,
      icon: Trophy,
      color: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      iconColor: "text-amber-700",
      bgColor: "bg-amber-200"
    });
  }

  if (ceProgress >= 100) {
    autoAchievements.push({
      title: "CE Champion",
      description: "Completed annual continuing education requirements",
      icon: Star,
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
      iconColor: "text-emerald-700",
      bgColor: "bg-emerald-200"
    });
  }

  if (yearsOfExperience >= 1) {
    autoAchievements.push({
      title: "Professional",
      description: "Active dental professional",
      icon: Award,
      color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      iconColor: "text-blue-700",
      bgColor: "bg-blue-200"
    });
  }

  if (ceProgress >= 150) {
    autoAchievements.push({
      title: "Lifelong Learner",
      description: "Exceeded CE requirements by 50%",
      icon: Zap,
      color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      iconColor: "text-purple-700",
      bgColor: "bg-purple-200"
    });
  }

  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'award': return Award;
      case 'certification': return Star;
      case 'recognition': return Trophy;
      case 'milestone': return Target;
      case 'leadership': return Users;
      default: return Award;
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-generated Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Earned Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoAchievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <Card key={index} className={achievement.color}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full ${achievement.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`h-5 w-5 ${achievement.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements & Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map((achievement, index) => {
                const IconComponent = getAchievementIcon(achievement.type);
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant="secondary" className="text-xs mb-1">
                            {achievement.type}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No achievements recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Badges Earned</span>
              <Badge variant="secondary">{autoAchievements.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Manual Achievements</span>
              <Badge variant="secondary">{achievements.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Years of Experience</span>
              <Badge variant="secondary">{Math.floor(yearsOfExperience)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">CE Completion Rate</span>
              <Badge variant={ceProgress >= 100 ? "default" : "secondary"}>
                {Math.round(ceProgress)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}