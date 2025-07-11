import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Settings, 
  Paperclip,
  Brain,
  BookOpen,
  Calculator,
  HelpCircle,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: number;
  title?: string;
  messages: ChatMessage[];
  lastMessageAt: string;
}

interface ChatInterfaceProps {
  subjectId?: number;
  subjectName?: string;
}

export default function ChatInterface({ subjectId, subjectName }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewSession = async (initialMessage: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/chat/sessions", {
        subjectId,
        title: `Chat about ${subjectName || 'Learning'}`,
        message: initialMessage,
      });

      if (response.ok) {
        const session = await response.json();
        setCurrentSession(session);
        setMessages(session.messages || []);
      }
    } catch (error) {
      console.error("Error starting chat session:", error);
      toast({
        title: "Error",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    if (!currentSession) {
      await startNewSession(message);
      setNewMessage("");
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await apiRequest("POST", `/api/chat/sessions/${currentSession.id}/messages`, {
        message,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.aiMessage]);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setNewMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const quickActions = [
    { icon: Brain, label: "Start Brain Tease", action: () => sendMessage("Can you help me with flashcards?") },
    { icon: HelpCircle, label: "Take a Quiz", action: () => sendMessage("I want to take a quiz") },
    { icon: Calculator, label: "Math Helper", action: () => sendMessage("Help me with math problems") },
    { icon: BookOpen, label: "Study Together", action: () => sendMessage("Let's study together") },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Main Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success-mint to-edu-blue rounded-full flex items-center justify-center">
                  <MessageCircle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-readable-dark">Rafiki AI Tutor</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-mint rounded-full"></div>
                    <span className="text-sm text-success-mint">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-success-mint">
                  <Mic size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-edu-blue">
                  <Settings size={16} />
                </Button>
              </div>
            </div>
            {subjectName && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-edu-blue/10 text-edu-blue">
                  {subjectName}
                </Badge>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-success-mint" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-readable-dark mb-2">
                  Welcome to Rafiki AI! 👋
                </h3>
                <p className="text-gray-600 mb-4">
                  I'm here to help you with your Grade 8 CBC studies. Ask me anything!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Help me with algebra",
                    "Explain photosynthesis",
                    "Practice English grammar",
                    "Kiswahili vocabulary"
                  ].map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(prompt)}
                      className="text-sm"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-success-mint rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="text-white" size={14} />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-md ${
                      message.role === "user"
                        ? "bg-edu-blue text-white"
                        : "bg-gray-100 text-readable-dark"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.role === "user" ? "text-blue-200 text-right" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {user?.firstName?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-success-mint rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-white" size={14} />
                </div>
                <div className="bg-gray-200 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-100 p-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 mr-2">Suggestions:</span>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <Paperclip size={16} />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message or ask a question..."
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-success-mint"
                >
                  <Mic size={16} />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="bg-edu-blue text-white hover:bg-blue-600"
              >
                <Send size={16} />
              </Button>
            </form>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Brain size={12} />
                  <span>AI-powered responses</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mic size={12} />
                  <span>Voice enabled</span>
                </span>
              </div>
              <span className="text-xs text-gray-400">Powered by ChatGPT 4o</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-readable-dark mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.action}
                  className="w-full justify-start"
                  disabled={isLoading}
                >
                  <action.icon size={16} className="mr-3" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Tips */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-readable-dark mb-4">Today's Learning Tips</h3>
            <div className="space-y-3">
              <div className="bg-success-mint/10 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="text-success-mint mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-readable-dark">Practice Daily</p>
                    <p className="text-xs text-gray-600">Spend 20 minutes each day on Brain Tease flashcards</p>
                  </div>
                </div>
              </div>
              <div className="bg-edu-blue/10 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="text-edu-blue mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-readable-dark">Track Progress</p>
                    <p className="text-xs text-gray-600">Complete all activities in a strand before moving forward</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-readable-dark mb-4">Voice Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Voice Chat</span>
                <Badge className="bg-success-mint text-white">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-play Responses</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Voice Speed</span>
                <span className="text-xs text-gray-500">Normal</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Powered by ElevenLabs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
