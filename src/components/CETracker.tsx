import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, TrendingUp } from "lucide-react";

interface CETrackerProps {
  continuingEducation: any[];
  userRole: string;
  ceProgress: number;
}

export function CETracker({ continuingEducation, userRole, ceProgress }: CETrackerProps) {
  const currentYear = new Date().getFullYear();
  const requiredHours = userRole === 'dentist' ? 40 : 25;
  
  const thisYearCEs = continuingEducation.filter(ce => 
    new Date(ce.completion_date).getFullYear() === currentYear
  );
  
  const totalHours = thisYearCEs.reduce((sum, ce) => sum + (ce.hours || 0), 0);
  const remainingHours = Math.max(requiredHours - totalHours, 0);
  
  const categoryBreakdown = thisYearCEs.reduce((acc, ce) => {
    acc[ce.category] = (acc[ce.category] || 0) + ce.hours;
    return acc;
  }, {} as Record<string, number>);

  const upcomingDeadlines = continuingEducation
    .filter(ce => {
      const completionDate = new Date(ce.completion_date);
      const nextYear = new Date(currentYear + 1, 11, 31);
      return completionDate < nextYear;
    })
    .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CE Progress {currentYear}</p>
                <p className="text-2xl font-bold text-emerald-900">{totalHours}/{requiredHours} hrs</p>
              </div>
            </div>
            <Progress value={ceProgress} className="h-3" />
            <p className="text-sm text-emerald-700 mt-2">
              {ceProgress >= 100 ? "Requirements met!" : `${remainingHours} hours remaining`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses Completed</p>
                <p className="text-2xl font-bold text-blue-900">{thisYearCEs.length}</p>
              </div>
            </div>
            <p className="text-sm text-blue-700">This year</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours/Course</p>
                <p className="text-2xl font-bold text-purple-900">
                  {thisYearCEs.length > 0 ? (totalHours / thisYearCEs.length).toFixed(1) : '0'}
                </p>
              </div>
            </div>
            <p className="text-sm text-purple-700">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Hours by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryBreakdown).map(([category, hours]) => (
              <div key={category} className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground capitalize">{category}</p>
                <p className="text-xl font-bold">{Number(hours)}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent CE Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Continuing Education</CardTitle>
        </CardHeader>
        <CardContent>
          {continuingEducation.length > 0 ? (
            <div className="space-y-3">
              {continuingEducation
                .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())
                .slice(0, 5)
                .map((ce: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{ce.course_name}</h3>
                      <p className="text-sm text-muted-foreground">{ce.provider}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(ce.completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{ce.hours} hrs</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {ce.category}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No continuing education courses recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}