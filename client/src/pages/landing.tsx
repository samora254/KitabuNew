import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, MessageCircle, TrendingUp, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-soft-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-edu-blue to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Kitabu AI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AI-Powered Learning for Grade 8 CBC
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Study smarter with Rafiki, your AI tutor. Master Mathematics, English, Kiswahili, 
                Science, and Social Studies through interactive flashcards, quizzes, and personalized guidance.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-white text-edu-blue hover:bg-gray-100"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start Learning Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-mint rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Chat with Rafiki AI</p>
                      <p className="text-sm text-blue-200">Get instant help with any subject</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-highlight-coral rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Brain Tease Flashcards</p>
                      <p className="text-sm text-blue-200">Quick revision and memory boost</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-achievement-green rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Track Your Progress</p>
                      <p className="text-sm text-blue-200">Unlock new topics as you learn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-readable-dark mb-4">
            Everything You Need to Excel in Grade 8 CBC
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines AI-powered tutoring with interactive learning tools 
            designed specifically for the Kenyan CBC curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI Tutor Feature */}
          <Card className="border-success-mint/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-success-mint/20 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-success-mint" />
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Rafiki AI Tutor
              </h3>
              <p className="text-gray-600 mb-4">
                Chat with your AI tutor anytime for personalized explanations, step-by-step solutions, 
                and study guidance across all subjects.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Voice and text conversations</li>
                <li>• Contextual learning assistance</li>
                <li>• Available 24/7</li>
              </ul>
            </CardContent>
          </Card>

          {/* Brain Tease Feature */}
          <Card className="border-highlight-coral/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-highlight-coral/20 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-highlight-coral" />
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Brain Tease Flashcards
              </h3>
              <p className="text-gray-600 mb-4">
                Quick and effective revision through interactive flashcards designed to reinforce 
                key concepts and improve memory retention.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Interactive flip animations</li>
                <li>• Progress tracking</li>
                <li>• Spaced repetition system</li>
              </ul>
            </CardContent>
          </Card>

          {/* Quiz System Feature */}
          <Card className="border-edu-blue/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-edu-blue/20 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-edu-blue" />
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Interactive Quizzes
              </h3>
              <p className="text-gray-600 mb-4">
                Test your knowledge with subject-specific quizzes that adapt to your learning pace 
                and provide instant feedback.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Multiple question types</li>
                <li>• Instant scoring and feedback</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>

          {/* Progress Tracking Feature */}
          <Card className="border-achievement-green/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-achievement-green/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-achievement-green" />
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor your learning journey with detailed analytics, XP rewards, and a structured 
                progression system that unlocks new content.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• XP and level system</li>
                <li>• Strand-based progression</li>
                <li>• Achievement badges</li>
              </ul>
            </CardContent>
          </Card>

          {/* Homework Management Feature */}
          <Card className="border-purple-400/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Homework Management
              </h3>
              <p className="text-gray-600 mb-4">
                Complete teacher-assigned homework with exam-format questions and receive 
                detailed feedback on your submissions.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Teacher assignments</li>
                <li>• Due date tracking</li>
                <li>• Graded submissions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Security Feature */}
          <Card className="border-gray-400/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gray-400/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-readable-dark mb-2">
                Safe & Secure
              </h3>
              <p className="text-gray-600 mb-4">
                Your learning data is protected with enterprise-grade security. Focus on learning 
                while we keep your information safe.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Secure authentication</li>
                <li>• Data privacy protection</li>
                <li>• Age-appropriate content</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-readable-dark mb-4">
              Grade 8 CBC Subjects
            </h2>
            <p className="text-gray-600">
              Comprehensive coverage of all Grade 8 subjects in the Kenyan CBC curriculum
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { name: 'Mathematics', icon: '📊', color: 'bg-blue-500' },
              { name: 'English', icon: '📚', color: 'bg-purple-500' },
              { name: 'Kiswahili', icon: '🗣️', color: 'bg-red-500' },
              { name: 'Science', icon: '🔬', color: 'bg-green-500' },
              { name: 'Social Studies', icon: '🌍', color: 'bg-orange-500' },
            ].map((subject) => (
              <div key={subject.name} className="text-center">
                <div className={`w-16 h-16 ${subject.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-2xl">{subject.icon}</span>
                </div>
                <h3 className="font-semibold text-readable-dark">{subject.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-edu-blue to-success-mint py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Grade 8 students already excelling with Kitabu AI. 
            Start your free learning experience today!
          </p>
          <Button 
            size="lg" 
            className="bg-white text-edu-blue hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started for Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-readable-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-edu-blue rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Kitabu AI</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Kitabu AI. Empowering Grade 8 CBC learning with AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
