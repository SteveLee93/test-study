import React, { useState, useEffect } from 'react';
import { loadPartData } from '../utils/csvParser';
import { addToBlacklist, isQuestionBlacklisted, generateQuestionId } from '../utils/questionBlacklist';
import { Question } from '../types/Question';

interface BrowseQuestionsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const BrowseQuestionsScreen: React.FC<BrowseQuestionsScreenProps> = ({ navigation }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('2024_1회');
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const folders = ['2023_1회', '2023_2회', '2023_3회', '2024_1회', '2024_2회', '2024_3회'];
  const parts = [1, 2, 3, 4, 5];

  useEffect(() => {
    loadQuestions();
  }, [selectedFolder, selectedPart]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Include blacklisted questions for management purposes
      const partQuestions = await loadPartData(selectedFolder, selectedPart, true);
      setQuestions(partQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBlacklist = (question: Question, reason?: string) => {
    const finalReason = reason || prompt('블랙리스트 추가 사유를 입력하세요 (선택사항):') || undefined;
    addToBlacklist(selectedFolder, selectedPart, question, finalReason);
    // Force re-render to update blacklist status
    setQuestions([...questions]);
  };

  const getFilteredQuestions = (): Question[] => {
    if (!searchQuery.trim()) return questions;
    
    const query = searchQuery.toLowerCase();
    return questions.filter(question => 
      question.question.toLowerCase().includes(query) ||
      question.option1.toLowerCase().includes(query) ||
      question.option2.toLowerCase().includes(query) ||
      question.option3.toLowerCase().includes(query) ||
      question.option4.toLowerCase().includes(query) ||
      question.explanation.toLowerCase().includes(query)
    );
  };

  const truncateText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const filteredQuestions = getFilteredQuestions();

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }
  }, [
    // Header with Back Button
    React.createElement('div', {
      key: 'header',
      style: {
        backgroundColor: '#fff',
        padding: '15px',
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }
    }, [
      React.createElement('div', {
        key: 'nav',
        style: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px'
        }
      }, [
        React.createElement('button', {
          key: 'back',
          onClick: () => navigation.navigate('QuestionManagement'),
          style: {
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#4CAF50',
            marginRight: '10px'
          }
        }, '← 뒤로'),
        React.createElement('div', {
          key: 'title',
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333'
          }
        }, '문제 찾아보기')
      ]),
      React.createElement('div', {
        key: 'subtitle',
        style: {
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }
      }, '이상한 문제를 찾아서 블랙리스트에 추가하세요')
    ]),

    // Controls
    React.createElement('div', {
      key: 'controls',
      style: {
        padding: '15px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee'
      }
    }, [
      React.createElement('div', {
        key: 'selectors',
        style: {
          display: 'flex',
          gap: '10px',
          marginBottom: '15px'
        }
      }, [
        React.createElement('select', {
          key: 'folder',
          value: selectedFolder,
          onChange: (e: any) => setSelectedFolder(e.target.value),
          style: {
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }
        }, folders.map(folder => 
          React.createElement('option', { key: folder, value: folder }, folder)
        )),
        React.createElement('select', {
          key: 'part',
          value: selectedPart,
          onChange: (e: any) => setSelectedPart(Number(e.target.value)),
          style: {
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }
        }, parts.map(part => 
          React.createElement('option', { key: part, value: part }, `${part}과목`)
        ))
      ]),
      React.createElement('input', {
        key: 'search',
        type: 'text',
        placeholder: '문제 내용으로 검색...',
        value: searchQuery,
        onChange: (e: any) => setSearchQuery(e.target.value),
        style: {
          width: '100%',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          fontSize: '16px'
        }
      }),
      React.createElement('div', {
        key: 'info',
        style: {
          marginTop: '10px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }
      }, loading ? '로딩 중...' : `${filteredQuestions.length}개 문제`)
    ]),

    // Questions List
    React.createElement('div', {
      key: 'questions',
      style: {
        padding: '15px'
      }
    }, loading ? 
      React.createElement('div', {
        style: {
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }
      }, '문제를 불러오는 중...') :
      filteredQuestions.length === 0 ? 
        React.createElement('div', {
          style: {
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#fff',
            borderRadius: '10px'
          }
        }, searchQuery ? '검색 결과가 없습니다.' : '문제가 없습니다.') :
        filteredQuestions.map((question, index) => {
          const isBlacklisted = isQuestionBlacklisted(selectedFolder, selectedPart, question.question);
          
          return React.createElement('div', {
            key: index,
            style: {
              backgroundColor: '#fff',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: isBlacklisted ? '4px solid #f44336' : '4px solid #e0e0e0'
            }
          }, [
            React.createElement('div', {
              key: 'header',
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }
            }, [
              React.createElement('div', {
                key: 'info',
                style: {
                  fontSize: '14px',
                  color: '#666'
                }
              }, `문제 ${index + 1} | 정답: ${question.answer}번`),
              React.createElement('div', {
                key: 'status',
                style: {
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center'
                }
              }, [
                isBlacklisted && React.createElement('span', {
                  key: 'blacklisted',
                  style: {
                    fontSize: '12px',
                    color: '#f44336',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    backgroundColor: '#ffebee',
                    borderRadius: '10px'
                  }
                }, '블랙리스트'),
                !isBlacklisted && React.createElement('button', {
                  key: 'add',
                  onClick: () => handleAddToBlacklist(question),
                  style: {
                    padding: '6px 12px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }
                }, '블랙리스트 추가')
              ])
            ]),
            React.createElement('div', {
              key: 'question',
              style: {
                fontSize: '16px',
                color: '#333',
                lineHeight: '1.5',
                marginBottom: '15px',
                fontWeight: '500'
              }
            }, question.question),
            React.createElement('div', {
              key: 'options',
              style: {
                marginBottom: '15px'
              }
            }, [
              question.option1,
              question.option2,
              question.option3,
              question.option4
            ].map((option, optIndex) => 
              React.createElement('div', {
                key: optIndex,
                style: {
                  padding: '8px 12px',
                  margin: '5px 0',
                  backgroundColor: optIndex + 1 === question.answer ? '#e8f5e8' : '#f9f9f9',
                  borderRadius: '5px',
                  border: optIndex + 1 === question.answer ? '1px solid #4CAF50' : '1px solid #e0e0e0',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }, [
                React.createElement('span', {
                  key: 'number',
                  style: {
                    fontWeight: 'bold',
                    marginRight: '8px',
                    color: optIndex + 1 === question.answer ? '#4CAF50' : '#666'
                  }
                }, `${optIndex + 1}.`),
                React.createElement('span', {
                  key: 'text',
                  style: {
                    flex: 1,
                    color: optIndex + 1 === question.answer ? '#2E7D32' : '#333'
                  }
                }, option),
                optIndex + 1 === question.answer && React.createElement('span', {
                  key: 'correct',
                  style: {
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }
                }, '✓')
              ])
            )),
            React.createElement('div', {
              key: 'explanation',
              style: {
                fontSize: '14px',
                color: '#666',
                backgroundColor: '#f0f8ff',
                padding: '10px',
                borderRadius: '5px',
                borderLeft: '3px solid #2196F3'
              }
            }, [
              React.createElement('strong', { key: 'label' }, '해설: '),
              React.createElement('span', { key: 'text' }, truncateText(question.explanation))
            ])
          ]);
        })
    )
  ]);
};

export default BrowseQuestionsScreen;