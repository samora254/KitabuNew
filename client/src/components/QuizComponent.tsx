import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  orderIndex: number;
}

interface QuizComponentProps {
  quiz: {
    id: number;
    title: string;
    description?: string;
    timeLimit?: number;
    passingScore: number;
    questions: QuizQuestion[];
  };
  onSubmit: (answers: Record<number, string>, timeSpent: number) => void;
  onQuestionAnswer?: (questionId: number, answer: string) => void;
}

export default function QuizComponent({ quiz, onSubmit, onQuestionAnswer }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (quiz.timeLimit && timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted, quiz.timeLimit]);

  // Effect for tracking time spent without time limit
  useEffect(() => {
    if (!quiz.timeLimit && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSubmitted, quiz.timeLimit]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    onQuestionAnswer?.(questionId, answer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit(answers, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-readable-dark">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 mt-2">{quiz.description}</p>
              )}
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock size={16} className="text-gray-500" />
                <span className={timeLeft < 300 ? "text-highlight-coral font-medium" : "text-gray-600"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-gray-600">
                {getAnsweredCount()}/{quiz.questions.length} answered
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-readable-dark leading-relaxed">
                {currentQuestion.question}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </div>

            {/* Multiple Choice Options */}
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

            {/* True/False Options */}
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
          </div>
        </CardContent>
      </Card>

      {/* Navigation and Submit */}
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
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? "bg-edu-blue text-white"
                        : answers[quiz.questions[index].id]
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
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button onClick={handleNext} className="bg-edu-blue text-white hover:bg-blue-600">
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-achievement-green text-white hover:bg-green-600"
                  disabled={getAnsweredCount() === 0}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>

          {/* Submit Warning */}
          {getAnsweredCount() < quiz.questions.length && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="text-amber-600" size={16} />
                <span className="text-sm text-amber-800">
                  You have {quiz.questions.length - getAnsweredCount()} unanswered questions.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
