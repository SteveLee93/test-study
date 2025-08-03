export interface Question {
  id?: string; // Unique identifier for question
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: number;
  explanation: string;
}

export interface Part {
  partNumber: number;
  questions: Question[];
}

export interface ExamData {
  folderName: string;
  parts: Part[];
}

export type StudyMode = 'review' | 'test';

export interface StudySession {
  examData: ExamData;
  selectedParts: number[];
  mode: StudyMode;
  currentQuestionIndex: number;
  answers: number[];
  reviewStatus: ('understood' | 'review_again')[];
}

export interface TestResult {
  id: string;
  folderName: string;
  selectedParts: number[];
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  completedAt: Date;
  timeSpent?: number;
  wrongQuestionIds: number[];
}

export interface StudyHistory {
  testResults: TestResult[];
  totalTestsTaken: number;
  averageScore: number;
  lastTestDate?: Date;
}

export interface BlacklistedQuestion {
  id: string;
  folderName: string;
  partNumber: number;
  questionText: string;
  reason?: string;
  addedAt: Date;
}

export interface QuestionBlacklist {
  questions: BlacklistedQuestion[];
}