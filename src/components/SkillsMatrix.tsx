import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Star } from "lucide-react";

interface SkillsMatrixProps {
  skillsExpertise: any[];
}

export function SkillsMatrix({ skillsExpertise }: SkillsMatrixProps) {
  const getSkillLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return { value: 25, color: 'text-red-600', bg: 'bg-red-100' };
      case 'intermediate':
        return { value: 50, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'advanced':
        return { value: 75, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'expert':
        return { value: 100, color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { value: 0, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getSkillIcon = (skill: string) => {
    // You can expand this to map specific skills to icons
    if (skill.toLowerCase().includes('surgery')) return Target;
    if (skill.toLowerCase().includes('management')) return TrendingUp;
    return Star;
  };

  const skillCategories = skillsExpertise.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                <Star className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expert Level</p>
                <p className="text-lg font-bold">
                  {skillsExpertise.filter(s => s.level?.toLowerCase() === 'expert').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Advanced</p>
                <p className="text-lg font-bold">
                  {skillsExpertise.filter(s => s.level?.toLowerCase() === 'advanced').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intermediate</p>
                <p className="text-lg font-bold">
                  {skillsExpertise.filter(s => s.level?.toLowerCase() === 'intermediate').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Target className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Skills</p>
                <p className="text-lg font-bold">{skillsExpertise.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Category */}
      {Object.keys(skillCategories).length > 0 ? (
        Object.entries(skillCategories).map(([category, skills]: [string, any[]]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((skill, index) => {
                  const skillLevel = getSkillLevel(skill.level);
                  const IconComponent = getSkillIcon(skill.skill);
                  
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm">{skill.skill}</h3>
                          <Badge variant="secondary" className={`text-xs ${skillLevel.color}`}>
                            {skill.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={skillLevel.value} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {skill.years_experience} years
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No skills recorded yet</p>
              <p className="text-sm">Add your professional skills and expertise levels</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Development Recommendations */}
      {skillsExpertise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Development Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillsExpertise
                .filter(skill => skill.level?.toLowerCase() !== 'expert')
                .slice(0, 3)
                .map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{skill.skill}</p>
                      <p className="text-xs text-muted-foreground">
                        Current level: {skill.level} • {skill.years_experience} years experience
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Consider advancing
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}