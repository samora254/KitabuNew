import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Brain, 
  BookOpen, 
  ClipboardList, 
  Clock, 
  Star,
  Lock,
  CheckCircle,
  Play
} from "lucide-react";

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
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

  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: [`/api/subjects/${id}`],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  const { data: strands, isLoading: strandsLoading } = useQuery({
    queryKey: [`/api/subjects/${id}/strands`],
    enabled: isAuthenticated && !!id,
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

  if (subjectLoading || strandsLoading) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Subject not found</h2>
            <p className="text-gray-600 mb-4">The subject you're looking for doesn't exist.</p>
            <Link href="/subjects">
              <Button>Back to Subjects</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const userProgress = progressData?.progress || [];
  const subjectProgress = userProgress.filter((p: any) => p.subjectId === parseInt(id!));
  const completedTopics = subjectProgress.filter((p: any) => p.isCompleted).length;
  const totalStrands = strands?.length || subject.totalStrands || 20;
  const overallProgress = totalStrands > 0 ? Math.round((completedTopics / totalStrands) * 100) : 0;

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
        {/* Header */}
        <div className="mb-8">
          <Link href="/subjects">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Subjects
            </Button>
          </Link>
          
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border">
            <div className="flex items-center space-x-4 mb-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: subject.iconColor }}
              >
                <span className="text-white">{getSubjectIcon(subject.name)}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-readable-dark">{subject.name}</h1>
                <p className="text-gray-600">{subject.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium text-readable-dark">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: subject.iconColor }}>
                  {completedTopics}
                </p>
                <p className="text-sm text-gray-600">Topics Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-achievement-green">
                  {Math.round(completedTopics * 25)}
                </p>
                <p className="text-sm text-gray-600">XP Earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-success-mint/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-success-mint/20 rounded-xl flex items-center justify-center">
                  <Brain className="text-success-mint" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-readable-dark">Brain Tease</h3>
                  <p className="text-sm text-gray-600">Review with flashcards</p>
                </div>
              </div>
              <Button className="w-full bg-success-mint text-white hover:bg-green-600">
                Start Flashcards
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-edu-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-edu-blue/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-edu-blue" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-readable-dark">Take Quiz</h3>
                  <p className="text-sm text-gray-600">Test your knowledge</p>
                </div>
              </div>
              <Button className="w-full bg-edu-blue text-white hover:bg-blue-600">
                Start Quiz
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-highlight-coral/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-highlight-coral/20 rounded-xl flex items-center justify-center">
                  <ClipboardList className="text-highlight-coral" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-readable-dark">Homework</h3>
                  <p className="text-sm text-gray-600">Complete assignments</p>
                </div>
              </div>
              <Button className="w-full bg-highlight-coral text-white hover:bg-red-500">
                View Homework
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Strands/Topics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-readable-dark">Learning Strands</h2>
              <Badge variant="secondary" className="bg-edu-blue/10 text-edu-blue">
                {strands?.length || 0} Available
              </Badge>
            </div>

            {strandsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : strands && strands.length > 0 ? (
              <div className="space-y-4">
                {strands.map((strand: any, index: number) => {
                  const strandProgress = subjectProgress.filter((p: any) => p.strandId === strand.id);
                  const strandCompleted = strandProgress.filter((p: any) => p.isCompleted).length;
                  const strandTotal = strand.totalTopics || 5;
                  const strandPercentage = Math.round((strandCompleted / strandTotal) * 100);
                  const isLocked = index > 0 && strands[index - 1] && !isStrandComplete(strands[index - 1].id);

                  function isStrandComplete(strandId: number) {
                    const progress = subjectProgress.filter((p: any) => p.strandId === strandId);
                    const completed = progress.filter((p: any) => p.isCompleted).length;
                    const total = strands.find((s: any) => s.id === strandId)?.totalTopics || 5;
                    return completed >= total * 0.8; // 80% completion to unlock next
                  }

                  return (
                    <div
                      key={strand.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        isLocked 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : 'bg-white border-gray-200 hover:border-primary/20 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLocked 
                              ? 'bg-gray-200' 
                              : strandPercentage >= 100 
                                ? 'bg-achievement-green/20' 
                                : 'bg-primary/20'
                          }`}>
                            {isLocked ? (
                              <Lock className="text-gray-400" size={16} />
                            ) : strandPercentage >= 100 ? (
                              <CheckCircle className="text-achievement-green" size={16} />
                            ) : (
                              <Play className="text-primary" size={16} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-readable-dark">{strand.name}</h3>
                            <p className="text-sm text-gray-600">{strand.description}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {isLocked ? (
                            <Badge variant="secondary" className="bg-gray-200 text-gray-500">
                              Locked
                            </Badge>
                          ) : strandPercentage >= 100 ? (
                            <Badge className="bg-achievement-green text-white">
                              Complete
                            </Badge>
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {strandPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!isLocked && (
                        <div className="space-y-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full progress-bar"
                              style={{ 
                                width: `${strandPercentage}%`,
                                backgroundColor: strandPercentage >= 100 ? 'var(--achievement-green)' : subject.iconColor
                              }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {strandCompleted}/{strandTotal} topics completed
                            </span>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Brain size={14} className="text-success-mint" />
                                <span className="text-gray-500">Flashcards</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen size={14} className="text-edu-blue" />
                                <span className="text-gray-500">Quizzes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClipboardList size={14} className="text-highlight-coral" />
                                <span className="text-gray-500">Homework</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isLocked && (
                        <div className="text-sm text-gray-500 mt-2">
                          Complete the previous strand to unlock this content
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No content available</h3>
                <p className="text-gray-600">Learning content for this subject is being prepared.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
