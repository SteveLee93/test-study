import { BlacklistedQuestion, QuestionBlacklist, Question } from '../types/Question';

const BLACKLIST_STORAGE_KEY = 'cbt_question_blacklist';

// Generate unique ID for question based on content and context
export const generateQuestionId = (folderName: string, partNumber: number, questionText: string): string => {
  const content = `${folderName}_${partNumber}_${questionText}`;
  // Use a simple hash function instead of btoa to handle Korean characters
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).slice(0, 16); // Convert to base36 and take first 16 chars
};

export const getQuestionBlacklist = (): QuestionBlacklist => {
  try {
    const stored = localStorage.getItem(BLACKLIST_STORAGE_KEY);
    if (!stored) {
      return { questions: [] };
    }
    
    const blacklist = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      questions: blacklist.questions.map((question: any) => ({
        ...question,
        addedAt: new Date(question.addedAt)
      }))
    };
  } catch (error) {
    console.error('Error loading question blacklist:', error);
    return { questions: [] };
  }
};

export const addToBlacklist = (
  folderName: string, 
  partNumber: number, 
  question: Question, 
  reason?: string
): void => {
  try {
    const blacklist = getQuestionBlacklist();
    const questionId = generateQuestionId(folderName, partNumber, question.question);
    
    // Check if already blacklisted
    const existingIndex = blacklist.questions.findIndex(q => q.id === questionId);
    if (existingIndex !== -1) {
      // Update existing entry
      blacklist.questions[existingIndex] = {
        ...blacklist.questions[existingIndex],
        reason,
        addedAt: new Date()
      };
    } else {
      // Add new entry
      const blacklistedQuestion: BlacklistedQuestion = {
        id: questionId,
        folderName,
        partNumber,
        questionText: question.question,
        reason,
        addedAt: new Date()
      };
      blacklist.questions.push(blacklistedQuestion);
    }
    
    localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(blacklist));
  } catch (error) {
    console.error('Error adding question to blacklist:', error);
  }
};

export const removeFromBlacklist = (questionId: string): void => {
  try {
    const blacklist = getQuestionBlacklist();
    blacklist.questions = blacklist.questions.filter(q => q.id !== questionId);
    localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(blacklist));
  } catch (error) {
    console.error('Error removing question from blacklist:', error);
  }
};

export const isQuestionBlacklisted = (folderName: string, partNumber: number, questionText: string): boolean => {
  const blacklist = getQuestionBlacklist();
  const questionId = generateQuestionId(folderName, partNumber, questionText);
  return blacklist.questions.some(q => q.id === questionId);
};

export const filterOutBlacklistedQuestions = (
  folderName: string, 
  partNumber: number, 
  questions: Question[]
): Question[] => {
  const blacklist = getQuestionBlacklist();
  const blacklistedIds = new Set(blacklist.questions.map(q => q.id));
  
  return questions.filter(question => {
    const questionId = generateQuestionId(folderName, partNumber, question.question);
    return !blacklistedIds.has(questionId);
  });
};

export const getBlacklistedQuestionsByFolder = (folderName?: string): BlacklistedQuestion[] => {
  const blacklist = getQuestionBlacklist();
  if (!folderName) {
    return blacklist.questions.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }
  
  return blacklist.questions
    .filter(q => q.folderName === folderName)
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
};

export const clearAllBlacklist = (): void => {
  try {
    localStorage.removeItem(BLACKLIST_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing blacklist:', error);
  }
};

export const getBlacklistStats = (): { total: number; byFolder: { [key: string]: number } } => {
  const blacklist = getQuestionBlacklist();
  const byFolder: { [key: string]: number } = {};
  
  blacklist.questions.forEach(question => {
    byFolder[question.folderName] = (byFolder[question.folderName] || 0) + 1;
  });
  
  return {
    total: blacklist.questions.length,
    byFolder
  };
};