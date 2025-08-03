import { TestResult, StudyHistory } from '../types/Question';

const STORAGE_KEY = 'cbt_test_results';

export const saveTestResult = (result: TestResult): void => {
  try {
    const existingResults = getTestResults();
    existingResults.push(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingResults));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
};

export const getTestResults = (): TestResult[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const results = JSON.parse(stored);
    // Convert date strings back to Date objects
    return results.map((result: any) => ({
      ...result,
      completedAt: new Date(result.completedAt)
    }));
  } catch (error) {
    console.error('Error loading test results:', error);
    return [];
  }
};

export const getStudyHistory = (): StudyHistory => {
  const results = getTestResults();
  
  if (results.length === 0) {
    return {
      testResults: [],
      totalTestsTaken: 0,
      averageScore: 0,
      lastTestDate: undefined
    };
  }

  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = Math.round(totalScore / results.length);
  const lastTestDate = results[results.length - 1]?.completedAt;

  return {
    testResults: results.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()),
    totalTestsTaken: results.length,
    averageScore,
    lastTestDate
  };
};

export const getResultsByFolder = (folderName: string): TestResult[] => {
  const results = getTestResults();
  return results.filter(result => result.folderName === folderName);
};

export const deleteTestResult = (resultId: string): void => {
  try {
    const results = getTestResults();
    const filteredResults = results.filter(result => result.id !== resultId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResults));
  } catch (error) {
    console.error('Error deleting test result:', error);
  }
};

export const clearAllResults = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing test results:', error);
  }
};

export const generateTestId = (): string => {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};