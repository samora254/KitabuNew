import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  GraduationCap, 
  Flame, 
  TrendingUp,
  Trophy,
  BookOpen,
  Clock,
  Target,
  Award,
  BarChart3
} from "lucide-react";

export default function Progress() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edu-blue"></div>
      </div>
    );
  }

  const stats = progressData?.stats || {
    totalXp: 0,
    currentLevel: 1,
    completedSubjects: 0,
    studyStreak: 0,
    averageScore: 0,
  };

  const userProgress = progressData?.progress || [];

  // Calculate subject progress
  const subjectProgress = subjects?.map((subject: any) => {
    const subjectUserProgress = userProgress.filter((p: any) => p.subjectId === subject.id);
    const completedTopics = subjectUserProgress.filter((p: any) => p.isCompleted).length;
    const totalStrands = subject.totalStrands || 20;
    const percentage = totalStrands > 0 ? Math.round((completedTopics / totalStrands) * 100) : 0;
    
    const scores = subjectUserProgress.filter((p: any) => p.score !== null && p.score !== undefined);
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / scores.length)
      : 0;

    const totalTimeSpent = subjectUserProgress.reduce((total: number, p: any) => {
      const hours = Math.random() * 2 + 0.5; // Mock time data
      return total + hours;
    }, 0);

    return {
      ...subject,
      completedTopics,
      totalStrands,
      percentage,
      averageScore,
      timeSpent: Math.round(totalTimeSpent * 10) / 10,
      lastAccessed: subjectUserProgress.reduce((latest: any, p: any) => {
        return !latest || new Date(p.lastAccessed) > new Date(latest.lastAccessed) ? p : latest;
      }, null)?.lastAccessed,
    };
  }) || [];

  const getSubjectIcon = (name: string) => {
    const icons: { [key: string]: any } = {
      'Mathematics': { icon: '📊', component: BarChart3, color: '#4A90E2' },
      'English': { icon: '📚', component: BookOpen, color: '#9B59B6' },
      'Kiswahili': { icon: '🗣️', component: BookOpen, color: '#E74C3C' },
      'Science': { icon: '🔬', component: Target, color: '#27AE60' },
      'Social Studies': { icon: '🌍', component: Award, color: '#F39C12' },
    };
    return icons[name] || { icon: '📖', component: BookOpen, color: '#4A90E2' };
  };

  // Mock weekly activity data
  const weeklyActivity = [
    { day: 'Mon', studyTime: 1.5, xpEarned: 120, quizzes: 2 },
    { day: 'Tue', studyTime: 2.0, xpEarned: 180, quizzes: 3 },
    { day: 'Wed', studyTime: 1.2, xpEarned: 95, quizzes: 1 },
    { day: 'Thu', studyTime: 2.5, xpEarned: 210, quizzes: 4 },
    { day: 'Fri', studyTime: 1.8, xpEarned: 150, quizzes: 2 },
    { day: 'Sat', studyTime: 1.3, xpEarned: 110, quizzes: 2 },
    { day: 'Sun', studyTime: 0.8, xpEarned: 75, quizzes: 1 },
  ];

  const maxStudyTime = Math.max(...weeklyActivity.map(d => d.studyTime));

  // Recent achievements
  const achievements = [
    {
      title: "English Master",
      description: "Completed all English strands",
      icon: Trophy,
      color: "text-achievement-green",
      bgColor: "bg-achievement-green/10",
      date: "2 days ago"
    },
    {
      title: "Week Warrior", 
      description: "7-day study streak",
      icon: Flame,
      color: "text-highlight-coral",
      bgColor: "bg-highlight-coral/10",
      date: "1 week ago"
    },
    {
      title: "Brain Teaser",
      description: "100 flashcards completed",
      icon: Star,
      color: "text-success-mint",
      bgColor: "bg-success-mint/10", 
      date: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-soft-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-readable-dark mb-2">Learning Progress</h1>
          <p className="text-gray-600">Track your performance and achievements across all subjects</p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total XP</h3>
                <Star className="text-achievement-green" size={20} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.totalXp.toLocaleString()}</p>
              <p className="text-xs text-achievement-green">Level {stats.currentLevel}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Subjects Completed</h3>
                <GraduationCap className="text-edu-blue" size={20} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.completedSubjects}/5</p>
              <p className="text-xs text-edu-blue">Great progress!</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Study Streak</h3>
                <Flame className="text-highlight-coral" size={20} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.studyStreak}</p>
              <p className="text-xs text-highlight-coral">days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
                <TrendingUp className="text-success-mint" size={20} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.averageScore}%</p>
              <p className="text-xs text-success-mint">+5% improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subject Progress Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-readable-dark mb-6">Subject Progress Overview</h3>
              <div className="space-y-4">
                {progressLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : (
                  subjectProgress.map((subject: any) => {
                    const iconData = getSubjectIcon(subject.name);
                    const IconComponent = iconData.component;
                    
                    return (
                      <div key={subject.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${subject.iconColor}20` }}
                            >
                              <IconComponent size={16} style={{ color: subject.iconColor }} />
                            </div>
                            <span className="font-medium text-readable-dark">{subject.name}</span>
                          </div>
                          <span className="text-sm font-medium text-readable-dark">{subject.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full progress-bar"
                            style={{ 
                              width: `${subject.percentage}%`,
                              backgroundColor: subject.percentage >= 70 ? 'var(--achievement-green)' : subject.iconColor
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{subject.completedTopics}/{subject.totalStrands} strands completed</span>
                          <span>{subject.timeSpent}h • Avg: {subject.averageScore}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-readable-dark mb-6">Weekly Activity</h3>
              
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32 border-b border-gray-200">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-edu-blue rounded-t transition-all duration-500"
                        style={{ height: `${(day.studyTime / maxStudyTime) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{day.day}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-edu-blue rounded"></div>
                      <span className="text-sm text-gray-600">Study Time (hours)</span>
                    </div>
                    <span className="text-sm font-medium">
                      {(weeklyActivity.reduce((sum, d) => sum + d.studyTime, 0) / 7).toFixed(1)}h avg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-success-mint rounded"></div>
                      <span className="text-sm text-gray-600">XP Earned</span>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(weeklyActivity.reduce((sum, d) => sum + d.xpEarned, 0) / 7)} XP avg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-achievement-green rounded"></div>
                      <span className="text-sm text-gray-600">Quizzes Completed</span>
                    </div>
                    <span className="text-sm font-medium">
                      {weeklyActivity.reduce((sum, d) => sum + d.quizzes, 0)} total
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-readable-dark mb-6">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${achievement.bgColor} border-opacity-20`}
                >
                  <div className={`w-12 h-12 ${achievement.bgColor} rounded-full flex items-center justify-center`}>
                    <achievement.icon className={achievement.color} size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-readable-dark">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <span className={`text-xs ${achievement.color}`}>{achievement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-readable-dark">Detailed Analytics</h3>
              <Button variant="outline" size="sm" className="text-edu-blue hover:text-blue-600">
                Export Report
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Completed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Average Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Time Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">XP Earned</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjectProgress.map((subject: any) => {
                    const iconData = getSubjectIcon(subject.name);
                    const IconComponent = iconData.component;
                    
                    return (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ backgroundColor: `${subject.iconColor}20` }}
                            >
                              <IconComponent size={14} style={{ color: subject.iconColor }} />
                            </div>
                            <span className="font-medium">{subject.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{subject.percentage}% ({subject.completedTopics}/{subject.totalStrands})</td>
                        <td className="py-3 px-4">{subject.averageScore}%</td>
                        <td className="py-3 px-4">{subject.timeSpent} hrs</td>
                        <td className="py-3 px-4">{Math.round(subject.completedTopics * 25)}</td>
                        <td className="py-3 px-4">
                          {subject.lastAccessed 
                            ? new Date(subject.lastAccessed).toLocaleDateString()
                            : 'Not started'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
