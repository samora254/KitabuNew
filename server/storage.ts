import {
  users,
  subjects,
  strands,
  topics,
  flashcards,
  quizzes,
  quizQuestions,
  homeworkAssignments,
  userProgress,
  userFlashcardProgress,
  userQuizAttempts,
  chatSessions,
  type User,
  type UpsertUser,
  type Subject,
  type Strand,
  type Topic,
  type Flashcard,
  type Quiz,
  type QuizQuestion,
  type HomeworkAssignment,
  type UserProgress,
  type UserQuizAttempt,
  type ChatSession,
  type ChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email-based authentication
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; firstName: string; lastName: string; password: string }): Promise<User>;

  // Subject operations
  getAllSubjects(): Promise<Subject[]>;
  getSubjectById(id: number): Promise<Subject | undefined>;
  getSubjectByCode(code: string): Promise<Subject | undefined>;

  // Strand operations
  getStrandsBySubject(subjectId: number): Promise<Strand[]>;
  getStrandById(id: number): Promise<Strand | undefined>;

  // Topic operations
  getTopicsByStrand(strandId: number): Promise<Topic[]>;
  getTopicById(id: number): Promise<Topic | undefined>;

  // Flashcard operations
  getFlashcardsByTopic(topicId: number): Promise<Flashcard[]>;
  getUserFlashcardProgress(userId: string, topicId: number): Promise<any[]>;
  updateFlashcardProgress(userId: string, flashcardId: number, isKnown: boolean): Promise<void>;

  // Quiz operations
  getQuizzesByTopic(topicId: number): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizAttempt(userId: string, quizId: number, score: number, answers: any, timeSpent: number): Promise<UserQuizAttempt>;
  getUserQuizAttempts(userId: string, quizId: number): Promise<UserQuizAttempt[]>;

  // Homework operations
  getHomeworkByTopic(topicId: number): Promise<HomeworkAssignment[]>;
  getActiveHomework(userId: string): Promise<HomeworkAssignment[]>;

  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserSubjectProgress(userId: string, subjectId: number): Promise<UserProgress[]>;
  updateUserProgress(userId: string, topicId: number, isCompleted: boolean, score?: number): Promise<void>;
  calculateUserStats(userId: string): Promise<{
    totalXp: number;
    currentLevel: number;
    completedSubjects: number;
    studyStreak: number;
    averageScore: number;
  }>;

  // Chat operations
  createChatSession(userId: string, subjectId?: number, title?: string): Promise<ChatSession>;
  getChatSession(userId: string, sessionId: number): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  addMessageToSession(sessionId: number, message: ChatMessage): Promise<void>;

  // Seed data operations
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; firstName: string; lastName: string; password: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: Math.random().toString(36).substring(2, 15),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        profileImageUrl: null,
        totalXp: 0,
        currentLevel: 1,
        studyStreak: 0,
        lastStudyDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(asc(subjects.name));
  }

  async getSubjectById(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async getSubjectByCode(code: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.code, code));
    return subject;
  }

  // Strand operations
  async getStrandsBySubject(subjectId: number): Promise<Strand[]> {
    return await db
      .select()
      .from(strands)
      .where(eq(strands.subjectId, subjectId))
      .orderBy(asc(strands.orderIndex));
  }

  async getStrandById(id: number): Promise<Strand | undefined> {
    const [strand] = await db.select().from(strands).where(eq(strands.id, id));
    return strand;
  }

  // Topic operations
  async getTopicsByStrand(strandId: number): Promise<Topic[]> {
    return await db
      .select()
      .from(topics)
      .where(eq(topics.strandId, strandId))
      .orderBy(asc(topics.orderIndex));
  }

  async getTopicById(id: number): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }

  // Flashcard operations
  async getFlashcardsByTopic(topicId: number): Promise<Flashcard[]> {
    return await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.topicId, topicId))
      .orderBy(asc(flashcards.orderIndex));
  }

  async getUserFlashcardProgress(userId: string, topicId: number): Promise<any[]> {
    return await db
      .select({
        flashcardId: userFlashcardProgress.flashcardId,
        isKnown: userFlashcardProgress.isKnown,
        reviewCount: userFlashcardProgress.reviewCount,
        question: flashcards.question,
        answer: flashcards.answer,
        explanation: flashcards.explanation,
      })
      .from(userFlashcardProgress)
      .innerJoin(flashcards, eq(userFlashcardProgress.flashcardId, flashcards.id))
      .where(
        and(
          eq(userFlashcardProgress.userId, userId),
          eq(flashcards.topicId, topicId)
        )
      );
  }

  async updateFlashcardProgress(userId: string, flashcardId: number, isKnown: boolean): Promise<void> {
    await db
      .insert(userFlashcardProgress)
      .values({
        userId,
        flashcardId,
        isKnown,
        lastReviewed: new Date(),
        reviewCount: 1,
      })
      .onConflictDoUpdate({
        target: [userFlashcardProgress.userId, userFlashcardProgress.flashcardId],
        set: {
          isKnown,
          lastReviewed: new Date(),
          reviewCount: sql`review_count + 1`,
        },
      });
  }

  // Quiz operations
  async getQuizzesByTopic(topicId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.topicId, topicId));
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.orderIndex));
  }

  async createQuizAttempt(userId: string, quizId: number, score: number, answers: any, timeSpent: number): Promise<UserQuizAttempt> {
    const [attempt] = await db
      .insert(userQuizAttempts)
      .values({
        userId,
        quizId,
        score,
        answers,
        timeSpent,
        completedAt: new Date(),
      })
      .returning();
    return attempt;
  }

  async getUserQuizAttempts(userId: string, quizId: number): Promise<UserQuizAttempt[]> {
    return await db
      .select()
      .from(userQuizAttempts)
      .where(and(eq(userQuizAttempts.userId, userId), eq(userQuizAttempts.quizId, quizId)))
      .orderBy(desc(userQuizAttempts.startedAt));
  }

  // Homework operations
  async getHomeworkByTopic(topicId: number): Promise<HomeworkAssignment[]> {
    return await db
      .select()
      .from(homeworkAssignments)
      .where(and(eq(homeworkAssignments.topicId, topicId), eq(homeworkAssignments.isActive, true)));
  }

  async getActiveHomework(userId: string): Promise<HomeworkAssignment[]> {
    return await db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.isActive, true))
      .orderBy(asc(homeworkAssignments.dueDate));
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserSubjectProgress(userId: string, subjectId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.subjectId, subjectId)));
  }

  async updateUserProgress(userId: string, topicId: number, isCompleted: boolean, score?: number): Promise<void> {
    // Get topic details to update related progress
    const topic = await this.getTopicById(topicId);
    if (!topic) return;

    const strand = await this.getStrandById(topic.strandId!);
    if (!strand) return;

    await db
      .insert(userProgress)
      .values({
        userId,
        subjectId: strand.subjectId!,
        strandId: topic.strandId!,
        topicId,
        isCompleted,
        score,
        completedAt: isCompleted ? new Date() : null,
        lastAccessed: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.topicId],
        set: {
          isCompleted,
          score,
          completedAt: isCompleted ? new Date() : null,
          lastAccessed: new Date(),
        },
      });

    // Update user XP if completed
    if (isCompleted && topic.xpReward) {
      await db
        .update(users)
        .set({
          totalXp: sql`total_xp + ${topic.xpReward}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  async calculateUserStats(userId: string): Promise<{
    totalXp: number;
    currentLevel: number;
    completedSubjects: number;
    studyStreak: number;
    averageScore: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        totalXp: 0,
        currentLevel: 1,
        completedSubjects: 0,
        studyStreak: 0,
        averageScore: 0,
      };
    }

    const progress = await this.getUserProgress(userId);
    const completedTopics = progress.filter(p => p.isCompleted);
    const scoresWithValues = progress.filter(p => p.score !== null && p.score !== undefined);
    
    const averageScore = scoresWithValues.length > 0 
      ? Math.round(scoresWithValues.reduce((sum, p) => sum + (p.score || 0), 0) / scoresWithValues.length)
      : 0;

    // Calculate level based on XP (every 500 XP = 1 level)
    const currentLevel = Math.floor((user.totalXp || 0) / 500) + 1;

    // Simple completed subjects calculation (if 90% of strands completed)
    const allSubjects = await this.getAllSubjects();
    let completedSubjects = 0;
    
    for (const subject of allSubjects) {
      const subjectProgress = await this.getUserSubjectProgress(userId, subject.id);
      const completedCount = subjectProgress.filter(p => p.isCompleted).length;
      const totalStrands = subject.totalStrands || 20;
      if (completedCount >= Math.floor(totalStrands * 0.9)) {
        completedSubjects++;
      }
    }

    return {
      totalXp: user.totalXp || 0,
      currentLevel,
      completedSubjects,
      studyStreak: user.studyStreak || 0,
      averageScore,
    };
  }

  // Chat operations
  async createChatSession(userId: string, subjectId?: number, title?: string): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        userId,
        subjectId,
        title: title || 'Chat with Rafiki',
        messages: [],
      })
      .returning();
    return session;
  }

  async getChatSession(userId: string, sessionId: number): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)));
    return session;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.lastMessageAt));
  }

  async addMessageToSession(sessionId: number, message: ChatMessage): Promise<void> {
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    
    if (session.length === 0) return;

    const currentMessages = (session[0].messages as ChatMessage[]) || [];
    const updatedMessages = [...currentMessages, message];

    await db
      .update(chatSessions)
      .set({
        messages: updatedMessages,
        lastMessageAt: new Date(),
      })
      .where(eq(chatSessions.id, sessionId));
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    // Check if data already exists
    const existingSubjects = await this.getAllSubjects();
    if (existingSubjects.length > 0) return;

    // Insert subjects
    const subjectData = [
      { name: 'Mathematics', code: 'MATH', description: 'Numbers, algebra, geometry, and data handling', iconColor: '#4A90E2' },
      { name: 'English', code: 'ENG', description: 'Reading, writing, speaking and listening', iconColor: '#9B59B6' },
      { name: 'Kiswahili', code: 'KIS', description: 'Kusoma, kuandika, mazungumzo na ufahamu', iconColor: '#E74C3C' },
      { name: 'Science', code: 'SCI', description: 'Matter, energy, living things, and earth science', iconColor: '#27AE60' },
      { name: 'Social Studies', code: 'SS', description: 'History, geography, civics and citizenship', iconColor: '#F39C12' },
    ];

    const insertedSubjects = await db.insert(subjects).values(subjectData).returning();

    // Insert sample strands for Mathematics
    const mathSubject = insertedSubjects.find(s => s.code === 'MATH');
    if (mathSubject) {
      const mathStrands = [
        { subjectId: mathSubject.id, name: 'Number Operations', description: 'Basic arithmetic operations', orderIndex: 1 },
        { subjectId: mathSubject.id, name: 'Fractions and Decimals', description: 'Working with fractions and decimals', orderIndex: 2 },
        { subjectId: mathSubject.id, name: 'Algebraic Expressions', description: 'Introduction to algebra', orderIndex: 3 },
        { subjectId: mathSubject.id, name: 'Geometry', description: 'Shapes, angles, and measurements', orderIndex: 4 },
        { subjectId: mathSubject.id, name: 'Data Handling', description: 'Statistics and probability basics', orderIndex: 5 },
      ];

      const insertedStrands = await db.insert(strands).values(mathStrands).returning();

      // Insert sample topics for Algebraic Expressions strand
      const algebraStrand = insertedStrands.find(s => s.name === 'Algebraic Expressions');
      if (algebraStrand) {
        const algebraTopics = [
          { strandId: algebraStrand.id, name: 'Variables and Constants', description: 'Understanding variables and constants', orderIndex: 1, xpReward: 25 },
          { strandId: algebraStrand.id, name: 'Simplifying Expressions', description: 'Combining like terms', orderIndex: 2, xpReward: 30 },
          { strandId: algebraStrand.id, name: 'Linear Equations', description: 'Solving simple linear equations', orderIndex: 3, xpReward: 35 },
          { strandId: algebraStrand.id, name: 'Substitution', description: 'Substituting values in expressions', orderIndex: 4, xpReward: 30 },
          { strandId: algebraStrand.id, name: 'Word Problems', description: 'Applying algebra to real-world problems', orderIndex: 5, xpReward: 40 },
        ];

        const insertedTopics = await db.insert(topics).values(algebraTopics).returning();

        // Insert sample flashcards for "Simplifying Expressions" topic
        const simplifyTopic = insertedTopics.find(t => t.name === 'Simplifying Expressions');
        if (simplifyTopic) {
          const flashcardData = [
            { topicId: simplifyTopic.id, question: 'Simplify: 3x + 5x - 2', answer: '8x - 2', explanation: 'Combine like terms: 3x + 5x = 8x', orderIndex: 1 },
            { topicId: simplifyTopic.id, question: 'Simplify: 2y + 7 - y + 3', answer: 'y + 10', explanation: 'Combine like terms: 2y - y = y, and 7 + 3 = 10', orderIndex: 2 },
            { topicId: simplifyTopic.id, question: 'Simplify: 4a - 2a + 6b', answer: '2a + 6b', explanation: 'Combine like terms: 4a - 2a = 2a, 6b remains as is', orderIndex: 3 },
            { topicId: simplifyTopic.id, question: 'Simplify: 5x + 3y - 2x - y', answer: '3x + 2y', explanation: 'Combine like terms: 5x - 2x = 3x, 3y - y = 2y', orderIndex: 4 },
          ];

          await db.insert(flashcards).values(flashcardData);

          // Insert sample quiz for the topic
          const [quiz] = await db.insert(quizzes).values({
            topicId: simplifyTopic.id,
            title: 'Simplifying Expressions Quiz',
            description: 'Test your understanding of combining like terms',
            timeLimit: 15,
            passingScore: 70,
            maxAttempts: 3,
          }).returning();

          // Insert quiz questions
          const quizQuestionData = [
            {
              quizId: quiz.id,
              question: 'Simplify: 7x + 2x - 3',
              questionType: 'multiple_choice',
              options: ['9x - 3', '9x + 3', '5x - 3', '7x - 1'],
              correctAnswer: '9x - 3',
              explanation: 'Combine like terms: 7x + 2x = 9x',
              points: 2,
              orderIndex: 1,
            },
            {
              quizId: quiz.id,
              question: 'What is the coefficient of x in the expression 5x + 3y?',
              questionType: 'multiple_choice',
              options: ['3', '5', '8', '1'],
              correctAnswer: '5',
              explanation: 'The coefficient is the number multiplying the variable',
              points: 2,
              orderIndex: 2,
            },
          ];

          await db.insert(quizQuestions).values(quizQuestionData);

          // Insert sample homework
          await db.insert(homeworkAssignments).values({
            topicId: simplifyTopic.id,
            title: 'Practice Simplifying Expressions',
            description: 'Complete the following algebraic expression problems',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
            maxScore: 100,
            teacherInstructions: 'Show all your working steps',
          });
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
