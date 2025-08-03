import React, { useState, useEffect } from 'react';
import { 
  getQuestionBlacklist, 
  removeFromBlacklist, 
  getBlacklistedQuestionsByFolder,
  clearAllBlacklist,
  getBlacklistStats
} from '../utils/questionBlacklist';
import { BlacklistedQuestion } from '../types/Question';
import { getAvailableFolders } from '../utils/csvParser';

interface QuestionManagementScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const QuestionManagementScreen: React.FC<QuestionManagementScreenProps> = ({ navigation }) => {
  const [blacklistedQuestions, setBlacklistedQuestions] = useState<BlacklistedQuestion[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [stats, setStats] = useState<{ total: number; byFolder: { [key: string]: number } }>({ total: 0, byFolder: {} });
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBlacklistedQuestions();
  }, [selectedFolder]);

  const loadData = async () => {
    const folders = await getAvailableFolders();
    setAvailableFolders(folders);
    
    const blacklistStats = getBlacklistStats();
    setStats(blacklistStats);
    
    loadBlacklistedQuestions();
  };

  const loadBlacklistedQuestions = () => {
    const questions = getBlacklistedQuestionsByFolder(selectedFolder === 'all' ? undefined : selectedFolder);
    setBlacklistedQuestions(questions);
  };

  const handleRemoveFromBlacklist = (questionId: string) => {
    if (confirm('이 문제를 블랙리스트에서 제거하시겠습니까?')) {
      removeFromBlacklist(questionId);
      loadData(); // Reload all data to update stats
    }
  };

  const handleClearAll = () => {
    if (confirm('모든 블랙리스트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      clearAllBlacklist();
      loadData();
    }
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

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
      }, '문제 관리'),
      React.createElement('div', {
        key: 'subtitle',
        style: {
          fontSize: '14px',
          textAlign: 'center',
          color: '#666',
          marginBottom: '15px'
        }
      }, '이상한 문제를 블랙리스트에서 관리하세요'),
      
      // Statistics
      React.createElement('div', {
        key: 'stats',
        style: {
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '14px',
          color: '#666',
          backgroundColor: '#f9f9f9',
          padding: '10px',
          borderRadius: '8px'
        }
      }, [
        React.createElement('div', {
          key: 'total',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', { key: 'label' }, '총 블랙리스트'),
          React.createElement('div', { 
            key: 'value', 
            style: { fontWeight: 'bold', color: '#f44336', fontSize: '16px' } 
          }, stats.total)
        ]),
        React.createElement('div', {
          key: 'current',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', { key: 'label' }, '현재 필터'),
          React.createElement('div', { 
            key: 'value', 
            style: { fontWeight: 'bold', color: '#333', fontSize: '16px' } 
          }, blacklistedQuestions.length)
        ])
      ])
    ]),

    // Filter and Actions
    React.createElement('div', {
      key: 'controls',
      style: {
        padding: '15px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee'
      }
    }, [
      React.createElement('div', {
        key: 'filter',
        style: { marginBottom: '10px' }
      }, React.createElement('select', {
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
        React.createElement('option', { key: 'all', value: 'all' }, '전체 폴더'),
        ...availableFolders.map(folder => 
          React.createElement('option', { key: folder, value: folder }, 
            `${folder} (${stats.byFolder[folder] || 0}개)`
          )
        )
      ])),
      
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'flex',
          gap: '10px'
        }
      }, [
        React.createElement('button', {
          key: 'browse',
          onClick: () => navigation.navigate('BrowseQuestions'),
          style: {
            flex: 1,
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }
        }, '📝 문제 찾아보기'),
        stats.total > 0 && React.createElement('button', {
          key: 'clear',
          onClick: handleClearAll,
          style: {
            padding: '12px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }
        }, '🗑️ 전체 삭제')
      ])
    ]),

    // Blacklisted Questions List
    React.createElement('div', {
      key: 'questions',
      style: {
        padding: '15px'
      }
    }, blacklistedQuestions.length === 0 ? 
      React.createElement('div', {
        style: {
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          backgroundColor: '#fff',
          borderRadius: '10px'
        }
      }, selectedFolder === 'all' ? 
        '블랙리스트에 등록된 문제가 없습니다.' : 
        `${selectedFolder}에 블랙리스트 문제가 없습니다.`
      ) :
      blacklistedQuestions.map(question => 
        React.createElement('div', {
          key: question.id,
          style: {
            backgroundColor: '#fff',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f44336'
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
              style: { flex: 1, marginRight: '10px' }
            }, [
              React.createElement('div', {
                key: 'folder',
                style: {
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  marginBottom: '5px'
                }
              }, `${question.folderName} - ${question.partNumber}과목`),
              React.createElement('div', {
                key: 'date',
                style: {
                  fontSize: '12px',
                  color: '#666'
                }
              }, `추가일: ${formatDate(question.addedAt)}`)
            ]),
            React.createElement('button', {
              key: 'remove',
              onClick: () => handleRemoveFromBlacklist(question.id),
              style: {
                padding: '8px 12px',
                backgroundColor: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer'
              }
            }, '제거')
          ]),
          React.createElement('div', {
            key: 'question',
            style: {
              fontSize: '16px',
              color: '#333',
              lineHeight: '1.5',
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '5px'
            }
          }, truncateText(question.questionText)),
          question.reason && React.createElement('div', {
            key: 'reason',
            style: {
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic',
              padding: '8px',
              backgroundColor: '#fff3cd',
              borderRadius: '5px',
              border: '1px solid #ffeaa7'
            }
          }, `사유: ${question.reason}`)
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

export default QuestionManagementScreen;