import {Question, Part, ExamData} from '../types/Question';
import {filterOutBlacklistedQuestions, generateQuestionId} from './questionBlacklist';

export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const parseAnswer = (answerText: string): number => {
  const circledNumbers: { [key: string]: number } = {
    '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5
  };
  
  const trimmed = answerText.trim();
  
  if (circledNumbers[trimmed]) {
    return circledNumbers[trimmed];
  }
  
  const parsed = parseInt(trimmed);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseCSVContent = (content: string, folderName?: string, partNumber?: number): Question[] => {
  const lines = content.trim().split('\n');
  const questions: Question[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    
    if (columns.length >= 7) {
      const question: Question = {
        id: folderName && partNumber ? generateQuestionId(folderName, partNumber, columns[0]) : undefined,
        question: columns[0],
        option1: columns[1],
        option2: columns[2],
        option3: columns[3],
        option4: columns[4],
        answer: parseAnswer(columns[5]),
        explanation: columns[6],
      };
      questions.push(question);
    }
  }
  
  return questions;
};

export const getAvailableFolders = async (): Promise<string[]> => {
  try {
    return ['2023_1회', '2023_2회', '2023_3회', '2024_1회', '2024_2회', '2024_3회'];
  } catch (error) {
    console.error('Error reading folders:', error);
    return ['2023_1회', '2023_2회', '2023_3회', '2024_1회', '2024_2회', '2024_3회'];
  }
};

export const loadPartData = async (folderName: string, partNumber: number, includeBlacklisted: boolean = false): Promise<Question[]> => {
  try {
    const response = await fetch(`/data/${folderName}/part${partNumber}.csv`);
    
    if (!response.ok) {
      console.log(`File not found: /data/${folderName}/part${partNumber}.csv`);
      return [];
    }
    
    const content = await response.text();
    const questions = parseCSVContent(content, folderName, partNumber);
    
    // Filter out blacklisted questions unless explicitly requested
    if (!includeBlacklisted) {
      return filterOutBlacklistedQuestions(folderName, partNumber, questions);
    }
    
    return questions;
  } catch (error) {
    console.error(`Error loading part ${partNumber}:`, error);
    return [];
  }
};

export const loadExamData = async (folderName: string, selectedParts: number[]): Promise<ExamData> => {
  const parts: Part[] = [];
  
  for (const partNumber of selectedParts) {
    const questions = await loadPartData(folderName, partNumber);
    parts.push({
      partNumber,
      questions,
    });
  }
  
  return {
    folderName,
    parts,
  };
};