import React, { useState, useEffect } from 'react';
import { getStudyHistory, getResultsByFolder, deleteTestResult } from '../utils/testResultsStorage';
import { StudyHistory, TestResult } from '../types/Question';

interface TestResultsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const TestResultsScreen: React.FC<TestResultsScreenProps> = ({ navigation }) => {
  const [studyHistory, setStudyHistory] = useState<StudyHistory | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  useEffect(() => {
    loadStudyHistory();
  }, []);

  const loadStudyHistory = () => {
    const history = getStudyHistory();
    setStudyHistory(history);
  };

  const handleDeleteResult = (resultId: string) => {
    if (confirm('이 테스트 결과를 삭제하시겠습니까?')) {
      deleteTestResult(resultId);
      loadStudyHistory();
    }
  };

  const getFilteredResults = (): TestResult[] => {
    if (!studyHistory) return [];
    if (selectedFolder === 'all') return studyHistory.testResults;
    return getResultsByFolder(selectedFolder);
  };

  const getAvailableFolders = (): string[] => {
    if (!studyHistory) return [];
    const folders = [...new Set(studyHistory.testResults.map(result => result.folderName))];
    return folders.sort();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  };

  if (!studyHistory) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }, '로딩 중...');
  }

  const filteredResults = getFilteredResults();
  const folders = getAvailableFolders();

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      style: {
        backgroundColor: '#fff',
        padding: '15px',
        borderBottom: '1px solid #eee'
      }
    }, [
      React.createElement('div', {
        key: 'title',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#333',
          marginBottom: '10px'
        }
      }, '테스트 결과'),
      React.createElement('div', {
        key: 'stats',
        style: {
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '14px',
          color: '#666'
        }
      }, [
        React.createElement('div', {
          key: 'total',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', { key: 'label' }, '총 테스트'),
          React.createElement('div', { 
            key: 'value', 
            style: { fontWeight: 'bold', color: '#333' } 
          }, studyHistory.totalTestsTaken)
        ]),
        React.createElement('div', {
          key: 'avg',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', { key: 'label' }, '평균 점수'),
          React.createElement('div', { 
            key: 'value', 
            style: { 
              fontWeight: 'bold', 
              color: getScoreColor(studyHistory.averageScore) 
            } 
          }, `${studyHistory.averageScore}점`)
        ]),
        React.createElement('div', {
          key: 'last',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', { key: 'label' }, '마지막 테스트'),
          React.createElement('div', { 
            key: 'value', 
            style: { fontWeight: 'bold', color: '#333', fontSize: '12px' } 
          }, studyHistory.lastTestDate ? formatDate(studyHistory.lastTestDate).split(' ')[0] : '-')
        ])
      ])
    ]),

    // Filter
    React.createElement('div', {
      key: 'filter',
      style: {
        padding: '15px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee'
      }
    }, [
      React.createElement('select', {
        key: 'folderSelect',
        value: selectedFolder,
        onChange: (e: any) => setSelectedFolder(e.target.value),
        style: {
          width: '100%',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          fontSize: '16px'
        }
      }, [
        React.createElement('option', { key: 'all', value: 'all' }, '전체 결과'),
        ...folders.map(folder => 
          React.createElement('option', { key: folder, value: folder }, folder)
        )
      ])
    ]),

    // Results List
    React.createElement('div', {
      key: 'results',
      style: {
        padding: '15px'
      }
    }, filteredResults.length === 0 ? 
      React.createElement('div', {
        style: {
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }
      }, '테스트 결과가 없습니다.') :
      filteredResults.map(result => 
        React.createElement('div', {
          key: result.id,
          style: {
            backgroundColor: '#fff',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        }, [
          React.createElement('div', {
            key: 'header',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }
          }, [
            React.createElement('div', {
              key: 'info',
              style: { flex: 1 }
            }, [
              React.createElement('div', {
                key: 'folder',
                style: {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333'
                }
              }, result.folderName),
              React.createElement('div', {
                key: 'parts',
                style: {
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '2px'
                }
              }, `${result.selectedParts.map(p => `${p}과목`).join(', ')}`)
            ]),
            React.createElement('div', {
              key: 'score',
              style: {
                fontSize: '24px',
                fontWeight: 'bold',
                color: getScoreColor(result.score)
              }
            }, `${result.score}점`)
          ]),
          React.createElement('div', {
            key: 'details',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#666',
              marginBottom: '10px'
            }
          }, [
            React.createElement('span', { key: 'correct' }, `정답: ${result.correctAnswers}/${result.totalQuestions}`),
            React.createElement('span', { key: 'date' }, formatDate(result.completedAt))
          ]),
          React.createElement('div', {
            key: 'actions',
            style: {
              display: 'flex',
              gap: '10px'
            }
          }, [
            result.wrongAnswers > 0 && React.createElement('button', {
              key: 'retry',
              onClick: () => navigation.navigate('TestMode', {
                folderName: result.folderName,
                selectedParts: result.selectedParts,
                retryWrongQuestions: true,
                wrongQuestionIds: result.wrongQuestionIds
              }),
              style: {
                flex: 1,
                padding: '8px',
                backgroundColor: '#FF9800',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer'
              }
            }, '오답 다시 풀기'),
            React.createElement('button', {
              key: 'delete',
              onClick: () => handleDeleteResult(result.id),
              style: {
                padding: '8px 12px',
                backgroundColor: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer'
              }
            }, '삭제')
          ])
        ])
      )
    ),

    // Back Button
    React.createElement('div', {
      key: 'back',
      style: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)'
      }
    }, React.createElement('button', {
      onClick: () => navigation.navigate('Home'),
      style: {
        padding: '15px 30px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }
    }, '홈으로'))
  ]);
};

export default TestResultsScreen;