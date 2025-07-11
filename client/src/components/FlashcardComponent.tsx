import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X } from "lucide-react";

interface FlashcardProps {
  flashcard: {
    id: number;
    question: string;
    answer: string;
    explanation?: string;
    isKnown?: boolean;
  };
  onMarkKnown: (flashcardId: number, isKnown: boolean) => void;
}

export default function FlashcardComponent({ flashcard, onMarkKnown }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkKnown = (known: boolean) => {
    onMarkKnown(flashcard.id, known);
    setIsFlipped(false); // Reset card to front after marking
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <Card className="flashcard-front bg-gradient-to-br from-success-mint/20 to-success-mint/10 border-2 border-success-mint/30">
          <div className="h-80 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-lg font-semibold text-readable-dark mb-4">Question:</h3>
            <div className="text-xl font-medium text-success-mint mb-6 leading-relaxed">
              {flashcard.question}
            </div>
            <p className="text-sm text-gray-600">Click the flip button to reveal the answer</p>
          </div>
        </Card>

        {/* Back of card */}
        <Card className="flashcard-back bg-gradient-to-br from-edu-blue/20 to-edu-blue/10 border-2 border-edu-blue/30">
          <div className="h-80 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-lg font-semibold text-readable-dark mb-4">Answer:</h3>
            <div className="text-xl font-bold text-edu-blue mb-4 leading-relaxed">
              {flashcard.answer}
            </div>
            {flashcard.explanation && (
              <div className="text-sm text-gray-600 space-y-1 max-w-md">
                <p className="font-medium">Explanation:</p>
                <p>{flashcard.explanation}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={() => handleMarkKnown(false)}
          className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
          disabled={!isFlipped}
        >
          <X size={16} className="mr-2" />
          Need Practice
        </Button>

        <Button
          variant="outline"
          onClick={handleFlip}
          className="bg-white border-2 border-gray-300 hover:bg-gray-50"
        >
          <RotateCcw size={16} className="mr-2" />
          Flip Card
        </Button>

        <Button
          onClick={() => handleMarkKnown(true)}
          className="bg-achievement-green text-white hover:bg-green-600"
          disabled={!isFlipped}
        >
          <Check size={16} className="mr-2" />
          Got It!
        </Button>
      </div>

      {/* Status Indicator */}
      {flashcard.isKnown !== undefined && (
        <div className="text-center mt-4">
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              flashcard.isKnown
                ? "bg-achievement-green/20 text-achievement-green"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {flashcard.isKnown ? "✓ Known" : "⚡ Needs Practice"}
          </span>
        </div>
      )}
    </div>
  );
}
