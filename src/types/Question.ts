export interface Question {
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