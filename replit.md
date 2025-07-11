# Kitabu AI - Grade 8 CBC Learning Platform

## Overview

Kitabu AI is a comprehensive educational platform designed for Grade 8 students in Kenya following the CBC (Competency-Based Curriculum). The application features an AI-powered tutor named Rafiki that helps students learn Mathematics, English, Kiswahili, Science, and Social Studies through interactive content, personalized guidance, flashcards, quizzes, and homework assignments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens for educational branding
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL session store
- **AI Integration**: OpenAI GPT-4o for the Rafiki AI tutor

### Database Design
The application uses a comprehensive schema designed for educational content management:
- **User Management**: Users table with progress tracking (XP, levels, study streaks)
- **Curriculum Structure**: Subjects → Strands → Topics hierarchy
- **Learning Materials**: Flashcards, quizzes, and homework assignments
- **Progress Tracking**: User progress per topic, flashcard progress, and quiz attempts
- **AI Chat**: Chat sessions and messages for Rafiki interactions

## Key Components

### Authentication System
- Integrated Replit Auth using OpenID Connect protocol
- Session-based authentication with PostgreSQL session storage
- User profile management with educational progress tracking
- Automatic redirect handling for unauthorized access

### AI Tutor (Rafiki)
- OpenAI GPT-4o integration for educational assistance
- Context-aware responses based on CBC curriculum
- Support for multiple subjects with culturally relevant examples
- Interactive chat interface with suggestion system
- Persistent chat sessions and message history

### Learning Content Management
- **Flashcards**: Spaced repetition system with progress tracking
- **Quizzes**: Timed assessments with various question types
- **Homework**: Assignment system with rubric-based evaluation
- **Progress Tracking**: XP system, levels, and study streak gamification

### UI/UX Framework
- Responsive design optimized for both desktop and mobile
- Custom color scheme with educational theme
- Comprehensive component library based on Radix UI
- Accessible design patterns throughout the application

## Data Flow

### User Journey
1. **Authentication**: Users authenticate via Replit Auth system
2. **Dashboard**: Overview of progress, subjects, and recent activity
3. **Subject Navigation**: Browse subjects, strands, and topics
4. **Learning Activities**: Engage with flashcards, quizzes, or homework
5. **AI Assistance**: Chat with Rafiki for personalized help
6. **Progress Tracking**: View achievements, XP, and learning analytics

### API Architecture
- RESTful API design with Express.js routing
- Middleware for authentication, logging, and error handling
- Type-safe request/response handling with Zod validation
- Structured error responses with appropriate HTTP status codes

### Database Operations
- Drizzle ORM for type-safe database operations
- Connection pooling with Neon serverless PostgreSQL
- Transactional operations for data consistency
- Optimized queries for educational content retrieval

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL (serverless)
- **AI Services**: OpenAI API for GPT-4o
- **Authentication**: Replit Auth service
- **Build/Deploy**: Vite for frontend bundling, esbuild for backend

### Key Libraries
- **Frontend**: React Query, Radix UI, Tailwind CSS, React Hook Form
- **Backend**: Express.js, Drizzle ORM, OpenAI SDK, Passport.js
- **Development**: TypeScript, tsx for development server

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier

## Deployment Strategy

### Development Environment
- Uses tsx for hot-reloading TypeScript server
- Vite development server with HMR for frontend
- Replit-specific plugins for development experience
- Environment-based configuration switching

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code for Node.js
- Database: Drizzle migrations for schema management
- Static serving: Express serves built frontend assets

### Architecture Benefits
- **Scalability**: Serverless database with connection pooling
- **Performance**: Optimized builds and efficient query patterns
- **Maintainability**: Type-safe codebase with clear separation of concerns
- **Educational Focus**: Purpose-built for CBC curriculum requirements
- **User Experience**: Responsive design with offline-first considerations

The application follows modern web development best practices with a focus on educational effectiveness, user engagement through gamification, and comprehensive progress tracking for Grade 8 CBC students.