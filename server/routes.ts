import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  generateTutorResponse, 
  generateQuizQuestions, 
  generateFlashcards,
  evaluateStudentAnswer 
} from "./openai";
import { 
  createChatSessionSchema, 
  chatMessageSchema,
  type ChatMessage 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed initial data on startup
  await storage.seedInitialData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subject routes
  app.get('/api/subjects', isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get('/api/subjects/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subject = await storage.getSubjectById(id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  // Strand routes
  app.get('/api/subjects/:subjectId/strands', isAuthenticated, async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const strands = await storage.getStrandsBySubject(subjectId);
      res.json(strands);
    } catch (error) {
      console.error("Error fetching strands:", error);
      res.status(500).json({ message: "Failed to fetch strands" });
    }
  });

  // Topic routes
  app.get('/api/strands/:strandId/topics', isAuthenticated, async (req, res) => {
    try {
      const strandId = parseInt(req.params.strandId);
      const topics = await storage.getTopicsByStrand(strandId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Flashcard routes
  app.get('/api/topics/:topicId/flashcards', isAuthenticated, async (req: any, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const userId = req.user.claims.sub;
      
      const flashcards = await storage.getFlashcardsByTopic(topicId);
      const userProgress = await storage.getUserFlashcardProgress(userId, topicId);
      
      // Combine flashcards with user progress
      const flashcardsWithProgress = flashcards.map(card => {
        const progress = userProgress.find(p => p.flashcardId === card.id);
        return {
          ...card,
          isKnown: progress?.isKnown || false,
          reviewCount: progress?.reviewCount || 0
        };
      });
      
      res.json(flashcardsWithProgress);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.post('/api/flashcards/:flashcardId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const flashcardId = parseInt(req.params.flashcardId);
      const userId = req.user.claims.sub;
      const { isKnown } = req.body;
      
      await storage.updateFlashcardProgress(userId, flashcardId, isKnown);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating flashcard progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Generate flashcards using AI
  app.post('/api/topics/:topicId/generate-flashcards', isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const { count = 5 } = req.body;
      
      const topic = await storage.getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      const strand = await storage.getStrandById(topic.strandId!);
      if (!strand) {
        return res.status(404).json({ message: "Strand not found" });
      }

      const subject = await storage.getSubjectById(strand.subjectId!);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const generatedCards = await generateFlashcards(topic.name, subject.name, count);
      res.json(generatedCards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ message: "Failed to generate flashcards" });
    }
  });

  // Quiz routes
  app.get('/api/topics/:topicId/quizzes', isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const quizzes = await storage.getQuizzesByTopic(topicId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/:quizId', isAuthenticated, async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const questions = await storage.getQuizQuestions(quizId);
      res.json({ ...quiz, questions });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quizzes/:quizId/submit', isAuthenticated, async (req: any, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const userId = req.user.claims.sub;
      const { answers, timeSpent } = req.body;
      
      // Get quiz questions to calculate score
      const questions = await storage.getQuizQuestions(quizId);
      let correctAnswers = 0;
      
      for (const question of questions) {
        const userAnswer = answers[question.id];
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      }
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      const attempt = await storage.createQuizAttempt(userId, quizId, score, answers, timeSpent);
      
      // Update topic progress if passing score achieved
      const quiz = await storage.getQuizById(quizId);
      if (quiz && score >= (quiz.passingScore || 70)) {
        await storage.updateUserProgress(userId, quiz.topicId!, true, score);
      }
      
      res.json({ attempt, score, correctAnswers, totalQuestions: questions.length });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Generate quiz questions using AI
  app.post('/api/topics/:topicId/generate-quiz', isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const { count = 5, difficulty = "medium" } = req.body;
      
      const topic = await storage.getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      const strand = await storage.getStrandById(topic.strandId!);
      if (!strand) {
        return res.status(404).json({ message: "Strand not found" });
      }

      const subject = await storage.getSubjectById(strand.subjectId!);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const generatedQuestions = await generateQuizQuestions(topic.name, subject.name, difficulty, count);
      res.json(generatedQuestions);
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      res.status(500).json({ message: "Failed to generate quiz questions" });
    }
  });

  // Homework routes
  app.get('/api/topics/:topicId/homework', isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const homework = await storage.getHomeworkByTopic(topicId);
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.get('/api/homework/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const homework = await storage.getActiveHomework(userId);
      res.json(homework);
    } catch (error) {
      console.error("Error fetching active homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      const stats = await storage.calculateUserStats(userId);
      res.json({ progress, stats });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get('/api/progress/subjects/:subjectId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subjectId = parseInt(req.params.subjectId);
      const progress = await storage.getUserSubjectProgress(userId, subjectId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching subject progress:", error);
      res.status(500).json({ message: "Failed to fetch subject progress" });
    }
  });

  // Chat routes for Rafiki AI
  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = createChatSessionSchema.parse(req.body);
      
      const session = await storage.createChatSession(
        userId, 
        validatedData.subjectId, 
        validatedData.title
      );
      
      // Add initial message from user
      const userMessage: ChatMessage = {
        role: "user",
        content: validatedData.message,
        timestamp: new Date().toISOString()
      };
      
      await storage.addMessageToSession(session.id, userMessage);
      
      // Generate AI response
      const context = {
        subject: validatedData.subjectId ? (await storage.getSubjectById(validatedData.subjectId))?.name : undefined,
        grade: "8",
        userLevel: "intermediate"
      };
      
      const aiResponse = await generateTutorResponse(validatedData.message, context);
      
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse.message,
        timestamp: new Date().toISOString()
      };
      
      await storage.addMessageToSession(session.id, aiMessage);
      
      const updatedSession = await storage.getChatSession(userId, session.id);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error creating chat session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get('/api/chat/sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      
      const session = await storage.getChatSession(userId, sessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  app.post('/api/chat/sessions/:sessionId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      const { message } = req.body;
      
      // Verify session belongs to user
      const session = await storage.getChatSession(userId, sessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      
      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
      
      await storage.addMessageToSession(sessionId, userMessage);
      
      // Generate AI response
      const context = {
        subject: session.subjectId ? (await storage.getSubjectById(session.subjectId))?.name : undefined,
        grade: "8",
        userLevel: "intermediate",
        previousMessages: (session.messages as ChatMessage[] || []).slice(-6) // Last 6 messages for context
      };
      
      const aiResponse = await generateTutorResponse(message, context);
      
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse.message,
        timestamp: new Date().toISOString()
      };
      
      await storage.addMessageToSession(sessionId, aiMessage);
      
      res.json({ 
        userMessage, 
        aiMessage, 
        suggestions: aiResponse.suggestions 
      });
    } catch (error) {
      console.error("Error adding message to chat:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Evaluate student answers using AI
  app.post('/api/evaluate-answer', isAuthenticated, async (req, res) => {
    try {
      const { question, studentAnswer, correctAnswer, subject } = req.body;
      
      const evaluation = await evaluateStudentAnswer(question, studentAnswer, correctAnswer, subject);
      res.json(evaluation);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      res.status(500).json({ message: "Failed to evaluate answer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
