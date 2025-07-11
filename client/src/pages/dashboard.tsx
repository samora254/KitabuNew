import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, ClipboardList, BookOpen, TrendingUp, Star, Flame, GraduationCap, ChartLine, GamepadIcon, Headphones, FileText } from "lucide-react";
import { Link } from "wouter";
import studentDashboardImage from "@assets/Student dashboard_1752251550707.jpg";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header with Gradient Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Homework is Easy and Fun! With Kitabu AI
              </h1>
              <p className="text-purple-100 mb-4">
                Welcome back, {firstName}! Ready to continue your learning journey?
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">If You Need Help, Chat With us</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                  <Star className="text-yellow-300" size={16} />
                  <span className="text-sm">Level {stats.currentLevel}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          </div>
        </div>

        {/* Learning Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">E-Books</h3>
            <p className="text-gray-600 text-sm">Digital textbooks for all subjects</p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Headphones className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Audio Books</h3>
            <p className="text-gray-600 text-sm">Listen and learn on the go</p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Revision Papers</h3>
            <p className="text-gray-600 text-sm">Past papers and practice tests</p>
          </Card>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Mathematics */}
          <Link href="/subjects/1" className="block">
            <Card className="bg-gradient-to-br from-red-400 to-pink-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Mathematics</h3>
                <p className="text-red-100 text-sm">Numbers, algebra, geometry & more</p>
              </CardContent>
            </Card>
          </Link>

          {/* English */}
          <Link href="/subjects/2" className="block">
            <Card className="bg-gradient-to-br from-green-400 to-teal-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">English</h3>
                <p className="text-green-100 text-sm">Grammar, writing, comprehension</p>
              </CardContent>
            </Card>
          </Link>

          {/* Kiswahili */}
          <Link href="/subjects/3" className="block">
            <Card className="bg-gradient-to-br from-blue-400 to-purple-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Kiswahili</h3>
                <p className="text-blue-100 text-sm">Lugha, utamaduni, fasihi</p>
              </CardContent>
            </Card>
          </Link>

          {/* Science */}
          <Link href="/subjects/4" className="block">
            <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Science</h3>
                <p className="text-orange-100 text-sm">Biology, chemistry, physics</p>
              </CardContent>
            </Card>
          </Link>

          {/* Social Studies */}
          <Link href="/subjects/5" className="block">
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Social</h3>
                <p className="text-yellow-100 text-sm">History, geography, civics</p>
              </CardContent>
            </Card>
          </Link>

          {/* Play Quiz Mania */}
          <Link href="/quiz" className="block">
            <Card className="bg-gradient-to-br from-gray-700 to-gray-900 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <GamepadIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="text-xl font-bold mb-2">PLAY QUIZ MANIA</h3>
                <p className="text-gray-300 text-sm">Test your knowledge</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Help Chat Interface */}
        <div className="mb-8">
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-t-2xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Need help solving a problem?"
                    className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Link href="/rafiki">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </Link>
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
