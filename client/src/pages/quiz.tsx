import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import QuizComponent from "@/components/QuizComponent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  Trophy,
  RotateCcw,
  TrendingUp
} from "lucide-react";

interface QuizResult {
  attempt: any;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export default function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);

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

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: isAuthenticated && !!quizId,
    retry: false,
  });

  const { data: attempts } = useQuery({
    queryKey: [`/api/quizzes/${quizId}/attempts`],
    enabled: isAuthenticated && !!quizId,
    retry: false,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ answers, timeSpent }: { answers: Record<number, string>; timeSpent: number }) => {
      const response = await apiRequest("POST", `/api/quizzes/${quizId}/submit`, {
        answers,
        timeSpent,
      });
      return await response.json();
    },
    onSuccess: (result: QuizResult) => {
      setQuizResult(result);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}/attempts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      toast({
        title: "Quiz Submitted!",
        description: `You scored ${result.score}% on this quiz.`,
        variant: result.score >= (quiz?.passingScore || 70) ? "default" : "destructive",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edu-blue"></div>
      </div>
    );
  }

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/subjects">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Subjects
            </Button>
          </Link>
          
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz not found</h2>
            <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist.</p>
            <Link href="/subjects">
              <Button>Back to Subjects</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleQuizSubmit = (answers: Record<number, string>, timeSpent: number) => {
    submitQuizMutation.mutate({ answers, timeSpent });
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    setShowResults(false);
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-achievement-green";
    if (score >= 80) return "text-success-mint";
    if (score >= 70) return "text-edu-blue";
    if (score >= 60) return "text-amber-600";
    return "text-highlight-coral";
  };

  const getGradeBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-achievement-green" };
    if (score >= 80) return { label: "Very Good", color: "bg-success-mint" };
    if (score >= 70) return { label: "Good", color: "bg-edu-blue" };
    if (score >= 60) return { label: "Fair", color: "bg-amber-500" };
    return { label: "Needs Improvement", color: "bg-highlight-coral" };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/subjects">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Subjects
            </Button>
          </Link>
        </div>

        {showResults && quizResult ? (
          /* Quiz Results */
          <div className="space-y-6">
            {/* Results Header */}
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="mb-6">
                  {quizResult.score >= (quiz.passingScore || 70) ? (
                    <Trophy className="mx-auto text-achievement-green mb-4" size={64} />
                  ) : (
                    <XCircle className="mx-auto text-highlight-coral mb-4" size={64} />
                  )}
                  <h1 className="text-3xl font-bold text-readable-dark mb-2">
                    Quiz Complete!
                  </h1>
                  <p className="text-gray-600">{quiz.title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className={`text-4xl font-bold ${getGradeColor(quizResult.score)}`}>
                      {quizResult.score}%
                    </p>
                    <p className="text-sm text-gray-600">Final Score</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-edu-blue">
                      {quizResult.correctAnswers}/{quizResult.totalQuestions}
                    </p>
                    <p className="text-sm text-gray-600">Correct Answers</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-success-mint">
                      {formatTime(quizResult.attempt.timeSpent)}
                    </p>
                    <p className="text-sm text-gray-600">Time Taken</p>
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  {(() => {
                    const badge = getGradeBadge(quizResult.score);
                    return (
                      <Badge className={`${badge.color} text-white px-4 py-2 text-base`}>
                        {badge.label}
                      </Badge>
                    );
                  })()}
                </div>

                {quizResult.score >= (quiz.passingScore || 70) ? (
                  <div className="bg-achievement-green/10 border border-achievement-green/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="text-achievement-green" size={20} />
                      <span className="text-achievement-green font-medium">
                        Congratulations! You passed this quiz!
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      You've unlocked the next topic in your learning path.
                    </p>
                  </div>
                ) : (
                  <div className="bg-highlight-coral/10 border border-highlight-coral/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <XCircle className="text-highlight-coral" size={20} />
                      <span className="text-highlight-coral font-medium">
                        Keep practicing! You need {quiz.passingScore || 70}% to pass.
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Review the material and try again when you're ready.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Attempts */}
            {attempts && attempts.length > 1 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-readable-dark mb-4">
                    Previous Attempts
                  </h3>
                  <div className="space-y-3">
                    {attempts.slice(0, 5).map((attempt: any, index: number) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">
                            Attempt {attempts.length - index}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`font-medium ${getGradeColor(attempt.score)}`}>
                            {attempt.score}%
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(attempt.timeSpent)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              {(attempts?.length || 0) < (quiz.maxAttempts || 3) && (
                <Button
                  onClick={handleRetakeQuiz}
                  variant="outline"
                  className="bg-white"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Retake Quiz
                </Button>
              )}
              <Link href="/subjects">
                <Button className="bg-edu-blue text-white hover:bg-blue-600">
                  <TrendingUp size={16} className="mr-2" />
                  Continue Learning
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Quiz Interface */
          <div>
            {/* Quiz Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-readable-dark">{quiz.title}</h1>
                    {quiz.description && (
                      <p className="text-gray-600 mt-1">{quiz.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="text-edu-blue" size={24} />
                    <Badge variant="secondary" className="bg-edu-blue/10 text-edu-blue">
                      {quiz.questions?.length || 0} Questions
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {quiz.timeLimit && (
                    <div className="flex items-center space-x-2">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-gray-600">
                        Time Limit: {quiz.timeLimit} minutes
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Star className="text-gray-400" size={16} />
                    <span className="text-gray-600">
                      Passing Score: {quiz.passingScore || 70}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="text-gray-400" size={16} />
                    <span className="text-gray-600">
                      Max Attempts: {quiz.maxAttempts || 3}
                    </span>
                  </div>
                </div>

                {attempts && attempts.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      You have attempted this quiz {attempts.length} time{attempts.length > 1 ? 's' : ''}. 
                      {attempts.length < (quiz.maxAttempts || 3) && (
                        <span> You have {(quiz.maxAttempts || 3) - attempts.length} attempt{(quiz.maxAttempts || 3) - attempts.length > 1 ? 's' : ''} remaining.</span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz Component */}
            {quiz.questions && quiz.questions.length > 0 ? (
              <QuizComponent
                quiz={quiz}
                onSubmit={handleQuizSubmit}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions available</h3>
                  <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
