import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export interface StudyPlan {
  currentTopic: string;
  nextSteps: string[];
  estimatedTime: number;
  difficulty: string;
}

export async function generateTutorResponse(
  userMessage: string,
  context: {
    subject?: string;
    grade?: string;
    currentTopic?: string;
    userLevel?: string;
    previousMessages?: Array<{ role: string; content: string }>;
  }
): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are Rafiki, a friendly and knowledgeable AI tutor for Grade 8 Kenyan CBC curriculum students. Your personality is encouraging, patient, and culturally aware. You help students with:

- Mathematics (algebra, geometry, data handling)
- English (reading, writing, speaking, listening)
- Kiswahili (kusoma, kuandika, mazungumzo)
- Science (matter, energy, living things, earth science)
- Social Studies (history, geography, civics)

Key guidelines:
1. Use simple, age-appropriate language for Grade 8 students (ages 13-14)
2. Be encouraging and positive, celebrating small wins
3. Break down complex concepts into manageable steps
4. Use real-world examples relevant to Kenyan context when possible
5. Ask follow-up questions to check understanding
6. Suggest practice activities or study methods
7. Use emojis occasionally to keep the tone friendly
8. If a student is struggling, offer simpler explanations or alternative approaches

Current context:
- Subject: ${context.subject || 'General'}
- Current topic: ${context.currentTopic || 'Not specified'}
- Student level: ${context.userLevel || 'Beginner'}

Respond as Rafiki would, being helpful, encouraging, and educational.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(context.previousMessages || []),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    const tutorMessage = response.choices[0].message.content || "I'm sorry, I couldn't process that. Could you please try again?";

    // Generate study suggestions based on the conversation
    const suggestions = await generateStudySuggestions(userMessage, context);

    return {
      message: tutorMessage,
      suggestions
    };
  } catch (error) {
    console.error("Error generating tutor response:", error);
    return {
      message: "I'm having trouble right now. Please try asking your question again in a moment! 😊",
      suggestions: ["Try a different question", "Check your internet connection", "Refresh the page"]
    };
  }
}

export async function generateStudySuggestions(
  userMessage: string,
  context: {
    subject?: string;
    currentTopic?: string;
  }
): Promise<string[]> {
  try {
    const prompt = `Based on this student question: "${userMessage}" in ${context.subject || 'general'} (topic: ${context.currentTopic || 'unknown'}), suggest 3 specific study activities that would help them learn better. Keep suggestions practical and actionable for a Grade 8 student. Format as a JSON array of strings.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating study suggestions:", error);
    return [
      "Practice with flashcards",
      "Try a related quiz",
      "Ask for more examples"
    ];
  }
}

export async function generateQuizQuestions(
  topic: string,
  subject: string,
  difficulty: string = "medium",
  count: number = 5
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}>> {
  try {
    const prompt = `Generate ${count} multiple-choice quiz questions for Grade 8 CBC curriculum.
    
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Each question should have:
- A clear, age-appropriate question
- 4 multiple choice options
- The correct answer
- A brief explanation

Format as JSON array with objects containing: question, options (array), correctAnswer, explanation`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}

export async function generateFlashcards(
  topic: string,
  subject: string,
  count: number = 10
): Promise<Array<{
  question: string;
  answer: string;
  explanation: string;
}>> {
  try {
    const prompt = `Generate ${count} educational flashcards for Grade 8 CBC curriculum.
    
Subject: ${subject}
Topic: ${topic}

Each flashcard should have:
- A clear question or prompt
- A concise answer
- A brief explanation or learning tip

Format as JSON array with objects containing: question, answer, explanation`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"flashcards": []}');
    return result.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
}

export async function evaluateStudentAnswer(
  question: string,
  studentAnswer: string,
  correctAnswer: string,
  subject: string
): Promise<{
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
}> {
  try {
    const prompt = `Evaluate this Grade 8 student's answer:

Question: ${question}
Student Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}
Subject: ${subject}

Provide evaluation as JSON with:
- isCorrect (boolean)
- score (0-100)
- feedback (encouraging message)
- suggestions (array of 2-3 learning tips)

Be encouraging and constructive in feedback.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isCorrect: result.isCorrect || false,
      score: result.score || 0,
      feedback: result.feedback || "Keep practicing!",
      suggestions: result.suggestions || ["Review the concept", "Try similar problems"]
    };
  } catch (error) {
    console.error("Error evaluating student answer:", error);
    return {
      isCorrect: false,
      score: 0,
      feedback: "I couldn't evaluate your answer right now. Please try again!",
      suggestions: ["Try again", "Ask for help"]
    };
  }
}
