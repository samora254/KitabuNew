import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"),
  grade: varchar("grade").default("8"),
  totalXp: integer("total_xp").default(0),
  currentLevel: integer("current_level").default(1),
  studyStreak: integer("study_streak").default(0),
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  description: text("description"),
  iconColor: varchar("icon_color").default("#4A90E2"),
  totalStrands: integer("total_strands").default(20),
});

// Strands (learning units within subjects)
export const strands = pgTable("strands", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id),
  name: varchar("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  totalTopics: integer("total_topics").default(5),
});

// Topics (specific learning objectives within strands)
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  strandId: integer("strand_id").references(() => strands.id),
  name: varchar("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  xpReward: integer("xp_reward").default(25),
});

// User Progress
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  strandId: integer("strand_id").references(() => strands.id),
  topicId: integer("topic_id").references(() => topics.id),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  score: integer("score"), // percentage score for quizzes
});

// Flashcards
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  difficulty: varchar("difficulty").default("medium"), // easy, medium, hard
  orderIndex: integer("order_index").notNull(),
});

// User Flashcard Progress
export const userFlashcardProgress = pgTable("user_flashcard_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  flashcardId: integer("flashcard_id").references(() => flashcards.id),
  isKnown: boolean("is_known").default(false),
  lastReviewed: timestamp("last_reviewed").defaultNow(),
  reviewCount: integer("review_count").default(0),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id),
  title: varchar("title").notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score").default(70), // percentage
  maxAttempts: integer("max_attempts").default(3),
});

// Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  question: text("question").notNull(),
  questionType: varchar("question_type").notNull(), // multiple_choice, true_false, short_answer
  options: jsonb("options"), // for multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(1),
  orderIndex: integer("order_index").notNull(),
});

// User Quiz Attempts
export const userQuizAttempts = pgTable("user_quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score"), // percentage
  answers: jsonb("answers"), // user's answers
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in seconds
});

// Homework Assignments
export const homeworkAssignments = pgTable("homework_assignments", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id),
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  maxScore: integer("max_score").default(100),
  teacherInstructions: text("teacher_instructions"),
  createdBy: varchar("created_by"), // teacher id if applicable
  isActive: boolean("is_active").default(true),
});

// Homework Questions
export const homeworkQuestions = pgTable("homework_questions", {
  id: serial("id").primaryKey(),
  homeworkId: integer("homework_id").references(() => homeworkAssignments.id),
  question: text("question").notNull(),
  questionType: varchar("question_type").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer"),
  rubric: text("rubric"), // scoring guidelines
  points: integer("points").default(10),
  orderIndex: integer("order_index").notNull(),
});

// User Homework Submissions
export const userHomeworkSubmissions = pgTable("user_homework_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  homeworkId: integer("homework_id").references(() => homeworkAssignments.id),
  answers: jsonb("answers"),
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedAt: timestamp("graded_at"),
  isLate: boolean("is_late").default(false),
});

// Chat Sessions with Rafiki AI
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  title: varchar("title"),
  messages: jsonb("messages"), // array of chat messages
  startedAt: timestamp("started_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  flashcardProgress: many(userFlashcardProgress),
  quizAttempts: many(userQuizAttempts),
  homeworkSubmissions: many(userHomeworkSubmissions),
  chatSessions: many(chatSessions),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  strands: many(strands),
  progress: many(userProgress),
  chatSessions: many(chatSessions),
}));

export const strandsRelations = relations(strands, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [strands.subjectId],
    references: [subjects.id],
  }),
  topics: many(topics),
  progress: many(userProgress),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  strand: one(strands, {
    fields: [topics.strandId],
    references: [strands.id],
  }),
  flashcards: many(flashcards),
  quizzes: many(quizzes),
  homeworkAssignments: many(homeworkAssignments),
  progress: many(userProgress),
}));

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  topic: one(topics, {
    fields: [flashcards.topicId],
    references: [topics.id],
  }),
  userProgress: many(userFlashcardProgress),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  topic: one(topics, {
    fields: [quizzes.topicId],
    references: [topics.id],
  }),
  questions: many(quizQuestions),
  attempts: many(userQuizAttempts),
}));

export const homeworkAssignmentsRelations = relations(homeworkAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [homeworkAssignments.topicId],
    references: [topics.id],
  }),
  questions: many(homeworkQuestions),
  submissions: many(userHomeworkSubmissions),
}));

// Export schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export const insertStrandSchema = createInsertSchema(strands).omit({
  id: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
});

export const insertHomeworkSchema = createInsertSchema(homeworkAssignments).omit({
  id: true,
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});

export const createChatSessionSchema = z.object({
  subjectId: z.number().optional(),
  title: z.string().optional(),
  message: z.string(),
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Strand = typeof strands.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type HomeworkAssignment = typeof homeworkAssignments.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
