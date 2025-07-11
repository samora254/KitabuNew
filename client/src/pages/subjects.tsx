import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Subjects() {
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

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: progressData } = useQuery({
    queryKey: ["/api/progress"],
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

  const userProgress = progressData?.progress || [];

  // Calculate subject progress
  const subjectsWithProgress = subjects?.map((subject: any) => {
    const subjectUserProgress = userProgress.filter((p: any) => p.subjectId === subject.id);
    const completedTopics = subjectUserProgress.filter((p: any) => p.isCompleted).length;
    const totalStrands = subject.totalStrands || 20;
    const percentage = totalStrands > 0 ? Math.round((completedTopics / totalStrands) * 100) : 0;
    
    const lastAccessed = subjectUserProgress.reduce((latest: any, p: any) => {
      return !latest || new Date(p.lastAccessed) > new Date(latest.lastAccessed) ? p : latest;
    }, null)?.lastAccessed;

    return {
      ...subject,
      completedTopics,
      totalStrands,
      percentage,
      lastAccessed,
    };
  }) || [];

  const getSubjectIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      'Mathematics': '📊',
      'English': '📚', 
      'Kiswahili': '🗣️',
      'Science': '🔬',
      'Social Studies': '🌍',
    };
    return icons[name] || '📖';
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-readable-dark mb-2">Grade 8 CBC Subjects</h1>
          <p className="text-gray-600">Choose a subject to continue your learning journey</p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjectsLoading ? (
            // Loading skeleton
            [...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-t-xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            subjectsWithProgress.map((subject: any) => (
              <Link key={subject.id} href={`/subjects/${subject.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                  <div 
                    className="h-32 relative overflow-hidden flex items-center justify-center text-white text-3xl"
                    style={{ backgroundColor: subject.iconColor }}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="relative z-10">{getSubjectIcon(subject.name)}</span>
                    <div className="absolute top-3 right-3 bg-white/20 rounded-lg px-2 py-1">
                      <span className="text-white text-xs font-medium">{subject.percentage}% Complete</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-readable-dark">{subject.name}</h3>
                      {subject.percentage >= 90 && (
                        <Badge variant="secondary" className="bg-achievement-green/20 text-achievement-green">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-readable-dark font-medium">
                          {subject.completedTopics}/{subject.totalStrands} strands
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full progress-bar transition-all duration-500"
                          style={{ 
                            width: `${subject.percentage}%`,
                            backgroundColor: subject.percentage >= 70 ? 'var(--achievement-green)' : subject.iconColor
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="text-gray-400" size={12} />
                        <span className="text-xs text-gray-500">
                          {subject.lastAccessed 
                            ? `Last studied: ${new Date(subject.lastAccessed).toLocaleDateString()}`
                            : 'Not started'
                          }
                        </span>
                      </div>
                      <TrendingUp className="text-current" size={16} style={{ color: subject.iconColor }} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Featured Learning Path */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-readable-dark">Recommended Learning Path</h3>
              <Badge variant="secondary" className="bg-success-mint/20 text-success-mint">
                AI Suggested
              </Badge>
            </div>
            
            <div className="space-y-4">
              {/* Current Strand */}
              <div className="border-l-4 border-edu-blue bg-edu-blue/5 rounded-r-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-readable-dark">Mathematics: Algebraic Expressions</h4>
                  <Badge variant="default" className="bg-edu-blue text-white">
                    Current
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Learn to simplify and solve algebraic expressions and equations
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-success-mint">🧠</span>
                    <span className="text-xs text-gray-600">8 flashcards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-edu-blue">❓</span>
                    <span className="text-xs text-gray-600">5 quizzes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-highlight-coral">📋</span>
                    <span className="text-xs text-gray-600">2 homework</span>
                  </div>
                </div>
              </div>

              {/* Next Strands */}
              <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4 opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-readable-dark">Mathematics: Linear Equations</h4>
                  <div className="flex items-center space-x-2">
                    <Lock className="text-gray-400" size={16} />
                    <span className="text-xs text-gray-500">Locked</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Solve linear equations in one variable</p>
              </div>

              <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4 opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-readable-dark">Science: States of Matter</h4>
                  <div className="flex items-center space-x-2">
                    <Lock className="text-gray-400" size={16} />
                    <span className="text-xs text-gray-500">Locked</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Understand the properties of solids, liquids, and gases</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
