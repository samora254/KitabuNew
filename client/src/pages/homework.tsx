import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  ClipboardList, 
  Clock, 
  Calendar,
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText,
  Send,
  Star,
  BookOpen,
  User
} from "lucide-react";

interface HomeworkQuestion {
  id: number;
  question: string;
  questionType: string;
  options?: string[];
  correctAnswer?: string;
  rubric?: string;
  points: number;
  orderIndex: number;
}

interface HomeworkAssignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore: number;
  teacherInstructions?: string;
  createdBy?: string;
  questions?: HomeworkQuestion[];
}

interface HomeworkSubmission {
  id: number;
  answers: Record<number, string>;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  isLate: boolean;
}

export default function Homework() {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);

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

  // Fetch homework assignment details
  const { data: homework, isLoading: homeworkLoading } = useQuery({
    queryKey: [`/api/homework/${homeworkId}`],
    enabled: isAuthenticated && !!homeworkId,
    retry: false,
  });

  // Fetch existing submission if any
  const { data: submission } = useQuery({
    queryKey: [`/api/homework/${homeworkId}/submission`],
    enabled: isAuthenticated && !!homeworkId,
    retry: false,
  });

  // Fetch active homework list if no specific ID
  const { data: activeHomework, isLoading: activeLoading } = useQuery({
    queryKey: ["/api/homework/active"],
    enabled: isAuthenticated && !homeworkId,
    retry: false,
  });

  const submitHomeworkMutation = useMutation({
    mutationFn: async (submissionData: { answers: Record<number, string> }) => {
      const response = await apiRequest("POST", `/api/homework/${homeworkId}/submit`, submissionData);
      return await response.json();
    },
    onSuccess: (result) => {
      setIsSubmitted(true);
      setShowSubmission(true);
      queryClient.invalidateQueries({ queryKey: [`/api/homework/${homeworkId}/submission`] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      toast({
        title: "Homework Submitted!",
        description: "Your homework has been submitted successfully.",
        variant: "default",
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
        description: "Failed to submit homework. Please try again.",
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

  // Show homework list if no specific homework ID
  if (!homeworkId) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <Link href="/subjects">
              <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
                <ArrowLeft size={16} className="mr-2" />
                Back to Subjects
              </Button>
            </Link>
            
            <h1 className="text-2xl md:text-3xl font-bold text-readable-dark mb-2">
              Homework Assignments
            </h1>
            <p className="text-gray-600">
              Complete your teacher-assigned homework and track your progress
            </p>
          </div>

          {activeLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeHomework && activeHomework.length > 0 ? (
            <div className="space-y-6">
              {activeHomework.map((hw: HomeworkAssignment) => {
                const dueDate = hw.dueDate ? new Date(hw.dueDate) : null;
                const isOverdue = dueDate && dueDate < new Date();
                const isDueSoon = dueDate && dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

                return (
                  <Card key={hw.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-highlight-coral/20 rounded-xl flex items-center justify-center">
                              <ClipboardList className="text-highlight-coral" size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-readable-dark">{hw.title}</h3>
                              {hw.createdBy && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <User size={12} />
                                  <span>Assigned by: {hw.createdBy}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {hw.description && (
                            <p className="text-gray-600 mb-3">{hw.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm">
                            {dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} className="text-gray-400" />
                                <span className={`${isOverdue ? 'text-highlight-coral' : isDueSoon ? 'text-amber-600' : 'text-gray-600'}`}>
                                  Due: {dueDate.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-gray-400" />
                              <span className="text-gray-600">Max Score: {hw.maxScore}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {isOverdue && (
                            <Badge className="bg-highlight-coral text-white">
                              Overdue
                            </Badge>
                          )}
                          {isDueSoon && !isOverdue && (
                            <Badge className="bg-amber-500 text-white">
                              Due Soon
                            </Badge>
                          )}
                          
                          <Link href={`/homework/${hw.id}`}>
                            <Button className="bg-highlight-coral text-white hover:bg-red-500">
                              Start Homework
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      {hw.teacherInstructions && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-4">
                          <p className="text-sm text-gray-700">
                            <strong>Instructions:</strong> {hw.teacherInstructions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No homework assignments</h3>
                <p className="text-gray-600 mb-4">You don't have any active homework assignments.</p>
                <Link href="/subjects">
                  <Button className="bg-edu-blue text-white hover:bg-blue-600">
                    Continue Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Show loading state for specific homework
  if (homeworkLoading) {
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

  // Show error if homework not found
  if (!homework) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/homework">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Homework
            </Button>
          </Link>
          
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Homework not found</h2>
            <p className="text-gray-600 mb-4">The homework assignment you're looking for doesn't exist.</p>
            <Link href="/homework">
              <Button>Back to Homework</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Show existing submission if already submitted
  if (submission && !showSubmission) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/homework">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Homework
            </Button>
          </Link>

          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="mx-auto text-achievement-green mb-4" size={64} />
              <h1 className="text-2xl font-bold text-readable-dark mb-2">
                Homework Already Submitted
              </h1>
              <p className="text-gray-600 mb-6">{homework.title}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-2xl font-bold text-edu-blue">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Submitted</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-achievement-green">
                    {submission.score || 'Pending'}
                    {submission.score && `/${homework.maxScore}`}
                  </p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
                <div>
                  <Badge className={submission.isLate ? "bg-highlight-coral text-white" : "bg-achievement-green text-white"}>
                    {submission.isLate ? "Late" : "On Time"}
                  </Badge>
                </div>
              </div>

              {submission.feedback && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-readable-dark mb-2">Teacher Feedback:</h4>
                  <p className="text-gray-700">{submission.feedback}</p>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setShowSubmission(true)}
                  variant="outline"
                >
                  <FileText size={16} className="mr-2" />
                  View Submission
                </Button>
                <Link href="/homework">
                  <Button className="bg-edu-blue text-white hover:bg-blue-600">
                    Back to Homework
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const questions = homework.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const dueDate = homework.dueDate ? new Date(homework.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    submitHomeworkMutation.mutate({ answers });
  };

  const formatTimeUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff < 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return "Due soon";
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/homework">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Homework
            </Button>
          </Link>
        </div>

        {/* Homework Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-readable-dark">{homework.title}</h1>
                {homework.description && (
                  <p className="text-gray-600 mt-1">{homework.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <ClipboardList className="text-highlight-coral" size={24} />
                <Badge variant="secondary" className="bg-highlight-coral/10 text-highlight-coral">
                  {questions.length} Questions
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {dueDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="text-gray-400" size={16} />
                  <span className={isOverdue ? "text-highlight-coral" : "text-gray-600"}>
                    {isOverdue ? "Overdue" : formatTimeUntilDue(dueDate)}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Star className="text-gray-400" size={16} />
                <span className="text-gray-600">
                  Max Score: {homework.maxScore} points
                </span>
              </div>
              {homework.createdBy && (
                <div className="flex items-center space-x-2">
                  <User className="text-gray-400" size={16} />
                  <span className="text-gray-600">
                    Teacher: {homework.createdBy}
                  </span>
                </div>
              )}
            </div>

            {homework.teacherInstructions && (
              <div className="mt-4 p-3 bg-highlight-coral/10 border border-highlight-coral/20 rounded-lg">
                <h4 className="font-medium text-readable-dark mb-1">Instructions:</h4>
                <p className="text-sm text-gray-700">{homework.teacherInstructions}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-gray-600">
                  {answeredCount}/{questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {questions.length > 0 ? (
          <>
            {/* Question Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold text-readable-dark leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                  </div>

                  {currentQuestion.rubric && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Grading Rubric:</strong> {currentQuestion.rubric}
                      </p>
                    </div>
                  )}

                  {/* Multiple Choice Questions */}
                  {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label 
                            htmlFor={`option-${index}`} 
                            className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* True/False Questions */}
                  {currentQuestion.questionType === 'true_false' && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="True" id="true-option" />
                        <Label 
                          htmlFor="true-option" 
                          className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          True
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="False" id="false-option" />
                        <Label 
                          htmlFor="false-option" 
                          className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          False
                        </Label>
                      </div>
                    </RadioGroup>
                  )}

                  {/* Short Answer Questions */}
                  {currentQuestion.questionType === 'short_answer' && (
                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[120px]"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-3">
                    {/* Question Navigator */}
                    <div className="flex items-center space-x-1">
                      {questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                            index === currentQuestionIndex
                              ? "bg-highlight-coral text-white"
                              : answers[questions[index].id]
                              ? "bg-achievement-green text-white"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button 
                        onClick={handleNext} 
                        className="bg-highlight-coral text-white hover:bg-red-500"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit}
                        className="bg-achievement-green text-white hover:bg-green-600"
                        disabled={answeredCount === 0 || submitHomeworkMutation.isPending}
                      >
                        {submitHomeworkMutation.isPending ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send size={16} className="mr-2" />
                            Submit Homework
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Submit Warning */}
                {answeredCount < questions.length && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="text-amber-600" size={16} />
                      <span className="text-sm text-amber-800">
                        You have {questions.length - answeredCount} unanswered questions.
                      </span>
                    </div>
                  </div>
                )}

                {isOverdue && (
                  <div className="mt-4 p-3 bg-highlight-coral/10 border border-highlight-coral/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircle className="text-highlight-coral" size={16} />
                      <span className="text-sm text-highlight-coral">
                        This homework is overdue. Your submission may be marked as late.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions available</h3>
              <p className="text-gray-600">This homework doesn't have any questions yet.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
