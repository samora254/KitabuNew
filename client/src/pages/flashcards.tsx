import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import FlashcardComponent from "@/components/FlashcardComponent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Brain, 
  RotateCcw, 
  CheckCircle, 
  X,
  Shuffle,
  Target
} from "lucide-react";

export default function Flashcards() {
  const { topicId } = useParams<{ topicId: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    known: 0,
    needsPractice: 0,
    totalReviewed: 0
  });

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

  const { data: flashcards, isLoading: flashcardsLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}/flashcards`],
    enabled: isAuthenticated && !!topicId,
    retry: false,
  });

  const { data: topic } = useQuery({
    queryKey: [`/api/topics/${topicId}`],
    enabled: isAuthenticated && !!topicId,
    retry: false,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ flashcardId, isKnown }: { flashcardId: number; isKnown: boolean }) => {
      await apiRequest("POST", `/api/flashcards/${flashcardId}/progress`, { isKnown });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${topicId}/flashcards`] });
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
        description: "Failed to update flashcard progress. Please try again.",
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

  if (flashcardsLoading) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="flex space-x-4 justify-center">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
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
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No flashcards available</h2>
            <p className="text-gray-600 mb-4">There are no flashcards for this topic yet.</p>
            <Button variant="outline">Generate Flashcards</Button>
          </div>
        </main>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const knownCount = flashcards.filter((f: any) => f.isKnown).length;
  const reviewCount = flashcards.filter((f: any) => f.reviewCount > 0).length;

  const handleMarkKnown = (flashcardId: number, isKnown: boolean) => {
    updateProgressMutation.mutate({ flashcardId, isKnown });
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      known: isKnown ? prev.known + 1 : Math.max(0, prev.known - 1),
      needsPractice: !isKnown ? prev.needsPractice + 1 : Math.max(0, prev.needsPractice - 1),
      totalReviewed: prev.totalReviewed + 1
    }));

    // Auto-advance to next card
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1000);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setCurrentIndex(randomIndex);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionStats({ known: 0, needsPractice: 0, totalReviewed: 0 });
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
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-readable-dark">Brain Tease Flashcards</h1>
                  <p className="text-gray-600">{topic?.name || 'Learning Topic'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="text-success-mint" size={24} />
                  <Badge variant="secondary" className="bg-success-mint/20 text-success-mint">
                    {flashcards.length} Cards
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Card {currentIndex + 1} of {flashcards.length}
                  </span>
                  <span className="text-gray-600">
                    {knownCount} known • {reviewCount} reviewed
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <FlashcardComponent
            flashcard={currentFlashcard}
            onMarkKnown={handleMarkKnown}
          />
        </div>

        {/* Navigation Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleShuffle}
                  className="bg-white"
                >
                  <Shuffle size={16} className="mr-2" />
                  Shuffle
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="bg-white"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Restart
                </Button>
              </div>

              <Button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="bg-edu-blue text-white hover:bg-blue-600"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="text-achievement-green mr-2" size={20} />
                <span className="text-lg font-bold text-achievement-green">{sessionStats.known}</span>
              </div>
              <p className="text-sm text-gray-600">Known</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <X className="text-highlight-coral mr-2" size={20} />
                <span className="text-lg font-bold text-highlight-coral">{sessionStats.needsPractice}</span>
              </div>
              <p className="text-sm text-gray-600">Need Practice</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="text-edu-blue mr-2" size={20} />
                <span className="text-lg font-bold text-edu-blue">{sessionStats.totalReviewed}</span>
              </div>
              <p className="text-sm text-gray-600">Total Reviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Completion Message */}
        {currentIndex === flashcards.length - 1 && (
          <Card className="mt-6 border-achievement-green/20 bg-achievement-green/5">
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto text-achievement-green mb-4" size={48} />
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Great job! You've reviewed all flashcards!
              </h3>
              <p className="text-gray-600 mb-4">
                You got {knownCount} out of {flashcards.length} cards right. Keep practicing to improve!
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="bg-white"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Study Again
                </Button>
                <Link href="/subjects">
                  <Button className="bg-achievement-green text-white hover:bg-green-600">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
