import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Trophy, Gift, Smile, Heart, Target, Crown, Brush } from "lucide-react";
import { toast } from "sonner";

interface KidProfile {
  id: string;
  name: string;
  age: number;
  level: number;
  points: number;
  badges: string[];
  streakDays: number;
  nextAppointment: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  unlocked: boolean;
  category: "brushing" | "flossing" | "visits" | "learning";
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  icon: any;
}

export default function GamifiedKidsApp() {
  const [selectedKid, setSelectedKid] = useState<KidProfile>({
    id: "kid1",
    name: "Emma",
    age: 8,
    level: 5,
    points: 1250,
    badges: ["Brushing Champion", "Floss Hero", "Brave Patient"],
    streakDays: 12,
    nextAppointment: "2024-02-15"
  });

  const [dailyTasks] = useState<DailyTask[]>([
    {
      id: "brush-morning",
      title: "Morning Brush",
      description: "Brush teeth for 2 minutes",
      completed: true,
      points: 10,
      icon: Brush
    },
    {
      id: "brush-evening",
      title: "Evening Brush",
      description: "Brush teeth before bed",
      completed: false,
      points: 10,
      icon: Brush
    },
    {
      id: "floss",
      title: "Floss Time",
      description: "Use floss between teeth",
      completed: false,
      points: 15,
      icon: Smile
    },
    {
      id: "healthy-snack",
      title: "Healthy Snack",
      description: "Choose tooth-friendly snacks",
      completed: true,
      points: 5,
      icon: Heart
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: "brush-streak-7",
      title: "Weekly Warrior",
      description: "Brush twice daily for 7 days straight",
      icon: Trophy,
      points: 100,
      unlocked: true,
      category: "brushing"
    },
    {
      id: "no-cavities",
      title: "Cavity-Free Champion",
      description: "No new cavities at checkup",
      icon: Crown,
      points: 200,
      unlocked: true,
      category: "visits"
    },
    {
      id: "floss-master",
      title: "Floss Master",
      description: "Floss for 30 days straight",
      icon: Star,
      points: 150,
      unlocked: false,
      category: "flossing"
    },
    {
      id: "dental-expert",
      title: "Dental Expert",
      description: "Complete all learning modules",
      icon: Target,
      points: 250,
      unlocked: false,
      category: "learning"
    }
  ]);

  const handleTaskComplete = (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      task.completed = true;
      setSelectedKid(prev => ({ ...prev, points: prev.points + task.points }));
      toast.success(`Great job! You earned ${task.points} points! 🎉`);
    }
  };

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const dailyProgress = (completedTasks / totalTasks) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
          <Smile className="h-8 w-8" />
          Kids Dental Adventure
        </h1>
        <p className="text-lg text-muted-foreground">
          Make dental care fun and rewarding! 🦷✨
        </p>
      </div>

      {/* Kid Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedKid.name[0]}
                </div>
                {selectedKid.name}
              </CardTitle>
              <CardDescription className="text-lg">
                Age {selectedKid.age} • Level {selectedKid.level} Dental Hero
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{selectedKid.points}</div>
              <div className="text-sm text-muted-foreground">Smile Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedKid.streakDays}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedKid.badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Feb 15</div>
              <div className="text-sm text-muted-foreground">Next Visit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="learning">Learn & Play</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Mission
              </CardTitle>
              <CardDescription>
                Complete all tasks to earn bonus points!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Progress</span>
                    <span>{completedTasks}/{totalTasks} tasks</span>
                  </div>
                  <Progress value={dailyProgress} className="h-3" />
                </div>
                
                <div className="grid gap-3">
                  {dailyTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        task.completed 
                          ? "bg-green-50 border-green-200" 
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <task.icon className={`h-6 w-6 ${
                          task.completed ? "text-green-600" : "text-gray-400"
                        }`} />
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={task.completed ? "default" : "secondary"}>
                          +{task.points} points
                        </Badge>
                        {!task.completed && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskComplete(task.id)}
                          >
                            Complete
                          </Button>
                        )}
                        {task.completed && (
                          <div className="text-green-600 font-medium">✓ Done!</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? "bg-yellow-50 border-yellow-200" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <achievement.icon className={`h-6 w-6 ${
                      achievement.unlocked ? "text-yellow-600" : "text-gray-400"
                    }`} />
                    {achievement.title}
                    {achievement.unlocked && <Badge className="bg-yellow-500">Unlocked!</Badge>}
                  </CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">
                      {achievement.category}
                    </Badge>
                    <div className="font-bold text-primary">+{achievement.points} points</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brush className="h-5 w-5 text-blue-500" />
                  Brushing Basics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn the proper way to brush your teeth with fun animations!
                </p>
                <Button variant="outline" className="w-full">Play Game</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Healthy Foods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover which foods make your teeth strong and healthy!
                </p>
                <Button variant="outline" className="w-full">Start Learning</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-green-500" />
                  Dental Visit Fun
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a virtual tour of the dentist office and meet the team!
                </p>
                <Button variant="outline" className="w-full">Take Tour</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Rewards Store
              </CardTitle>
              <CardDescription>
                Spend your Smile Points on awesome rewards!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="font-semibold">Golden Toothbrush</h3>
                  <p className="text-sm text-muted-foreground mb-2">Special edition toothbrush</p>
                  <div className="font-bold text-primary mb-2">500 Points</div>
                  <Button size="sm" disabled={selectedKid.points < 500}>
                    {selectedKid.points >= 500 ? "Claim" : "Need More Points"}
                  </Button>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">🎮</div>
                  <h3 className="font-semibold">Extra Game Time</h3>
                  <p className="text-sm text-muted-foreground mb-2">30 minutes bonus playtime</p>
                  <div className="font-bold text-primary mb-2">200 Points</div>
                  <Button size="sm" disabled={selectedKid.points < 200}>
                    {selectedKid.points >= 200 ? "Claim" : "Need More Points"}
                  </Button>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">🍎</div>
                  <h3 className="font-semibold">Healthy Snack</h3>
                  <p className="text-sm text-muted-foreground mb-2">Choose your favorite treat</p>
                  <div className="font-bold text-primary mb-2">100 Points</div>
                  <Button size="sm" disabled={selectedKid.points < 100}>
                    {selectedKid.points >= 100 ? "Claim" : "Need More Points"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}