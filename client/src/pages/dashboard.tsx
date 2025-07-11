import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, ClipboardList, BookOpen, TrendingUp, Star, Flame, GraduationCap, ChartLine } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: activeHomework } = useQuery({
    queryKey: ["/api/homework/active"],
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
  const firstName = user?.firstName || "Student";

  // Calculate subject progress
  const subjectProgress = subjects?.map((subject: any) => {
    const subjectUserProgress = userProgress.filter((p: any) => p.subjectId === subject.id);
    const completedTopics = subjectUserProgress.filter((p: any) => p.isCompleted).length;
    const totalStrands = subject.totalStrands || 20;
    const percentage = totalStrands > 0 ? Math.round((completedTopics / totalStrands) * 100) : 0;
    
    return {
      ...subject,
      completedTopics,
      totalStrands,
      percentage,
      lastAccessed: subjectUserProgress.reduce((latest: any, p: any) => {
        return !latest || new Date(p.lastAccessed) > new Date(latest.lastAccessed) ? p : latest;
      }, null)?.lastAccessed,
    };
  }) || [];

  return (
    <div className="min-h-screen bg-soft-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-edu-blue to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {firstName}! 👋</h1>
              <p className="text-blue-100 mb-4">Ready to continue your learning journey with Rafiki?</p>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium">Grade 8 CBC</span>
                </div>
                <div className="bg-achievement-green rounded-lg px-3 py-1">
                  <span className="text-sm font-medium">Level {stats.currentLevel}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Brain Tease Flashcards */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-success-mint/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success-mint/20 rounded-xl flex items-center justify-center">
                  <Brain className="text-success-mint" size={24} />
                </div>
                <span className="text-xs bg-success-mint/20 text-success-mint px-2 py-1 rounded-full font-medium">
                  Available
                </span>
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">Brain Tease</h3>
              <p className="text-gray-600 text-sm mb-4">Quick flashcards for revision and memory reinforcement</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Mathematics • Science</span>
                <TrendingUp className="text-success-mint" size={16} />
              </div>
            </CardContent>
          </Card>

          {/* Quiz Feature */}
          <Link href="/subjects" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-edu-blue/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-edu-blue/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-edu-blue" size={24} />
                  </div>
                  <span className="text-xs bg-highlight-coral/20 text-highlight-coral px-2 py-1 rounded-full font-medium">
                    Ready
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-readable-dark mb-2">Subject Quizzes</h3>
                <p className="text-gray-600 text-sm mb-4">Test your knowledge with subject-based questions</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">All Subjects</span>
                  <TrendingUp className="text-edu-blue" size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Homework Feature */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-highlight-coral/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-highlight-coral/20 rounded-xl flex items-center justify-center">
                  <ClipboardList className="text-highlight-coral" size={24} />
                </div>
                <span className="text-xs bg-achievement-green/20 text-achievement-green px-2 py-1 rounded-full font-medium">
                  {activeHomework?.length || 0} Available
                </span>
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">Homework</h3>
              <p className="text-gray-600 text-sm mb-4">Exam-format questions assigned by your teachers</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Due Soon</span>
                <TrendingUp className="text-highlight-coral" size={16} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Progress & Rafiki Chat Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Learning Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-readable-dark">Current Progress</h3>
                <Link href="/progress">
                  <Button variant="ghost" size="sm" className="text-edu-blue hover:text-blue-600">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {progressLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  subjectProgress.slice(0, 3).map((subject: any) => (
                    <div key={subject.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} 
                               style={{ backgroundColor: `${subject.iconColor}20` }}>
                            <BookOpen size={16} style={{ color: subject.iconColor }} />
                          </div>
                          <span className="font-medium text-readable-dark">{subject.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{subject.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full progress-bar" 
                          style={{ 
                            width: `${subject.percentage}%`,
                            backgroundColor: subject.percentage >= 70 ? 'var(--achievement-green)' : 'var(--edu-blue)'
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {subject.completedTopics}/{subject.totalStrands} topics completed
                        {subject.lastAccessed && (
                          <span> • Last studied: {new Date(subject.lastAccessed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat with Rafiki Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-success-mint to-edu-blue rounded-full flex items-center justify-center">
                    <MessageCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-readable-dark">Rafiki AI Tutor</h3>
                    <p className="text-sm text-success-mint">Online • Ready to help</p>
                  </div>
                </div>
                <Link href="/rafiki">
                  <Button className="bg-edu-blue text-white hover:bg-blue-600">
                    Start Chat
                  </Button>
                </Link>
              </div>

              {/* Recent Conversation Preview */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-success-mint rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="text-white" size={12} />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-readable-dark">Hi {firstName}! Ready to tackle some problems today?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-edu-blue rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-white">Yes! I need help with my studies.</p>
                  </div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">👤</span>
                  </div>
                </div>
              </div>

              {/* Voice Feature Preview */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MessageCircle className="text-success-mint" size={16} />
                <span className="text-sm text-gray-600">Voice chat available</span>
                <div className="flex space-x-1 ml-auto">
                  <div className="w-1 h-3 bg-success-mint rounded-full voice-indicator"></div>
                  <div className="w-1 h-2 bg-success-mint/60 rounded-full voice-indicator"></div>
                  <div className="w-1 h-4 bg-success-mint rounded-full voice-indicator"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total XP</h3>
                <Star className="text-achievement-green" size={16} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.totalXp.toLocaleString()}</p>
              <p className="text-xs text-achievement-green">Level {stats.currentLevel}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Subjects</h3>
                <GraduationCap className="text-edu-blue" size={16} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.completedSubjects}/5</p>
              <p className="text-xs text-edu-blue">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Study Streak</h3>
                <Flame className="text-highlight-coral" size={16} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.studyStreak}</p>
              <p className="text-xs text-highlight-coral">days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
                <ChartLine className="text-success-mint" size={16} />
              </div>
              <p className="text-2xl font-bold text-readable-dark">{stats.averageScore}%</p>
              <p className="text-xs text-success-mint">Great progress!</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-readable-dark mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {userProgress.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No recent activity yet</p>
                  <p className="text-sm text-gray-400">Start learning to see your progress here!</p>
                  <Link href="/subjects">
                    <Button className="mt-4 bg-edu-blue text-white hover:bg-blue-600">
                      Explore Subjects
                    </Button>
                  </Link>
                </div>
              ) : (
                userProgress
                  .filter((p: any) => p.isCompleted)
                  .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .slice(0, 5)
                  .map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-achievement-green/20 rounded-full flex items-center justify-center">
                        <BookOpen className="text-achievement-green" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-readable-dark">
                          Completed a topic
                        </p>
                        <p className="text-xs text-gray-500">
                          Score: {activity.score || 'N/A'}% • {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-achievement-green/20 text-achievement-green px-2 py-1 rounded-full">
                        +25 XP
                      </span>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
