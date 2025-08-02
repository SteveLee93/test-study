import React, {useState, useEffect} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../App';
import {loadExamData} from '../utils/csvParser';
import {Question, ExamData} from '../types/Question';

type ReviewModeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReviewMode'
>;
type ReviewModeScreenRouteProp = RouteProp<RootStackParamList, 'ReviewMode'>;

interface Props {
  navigation: ReviewModeScreenNavigationProp;
  route: ReviewModeScreenRouteProp;
}

const ReviewModeScreen: React.FC<Props> = ({navigation, route}) => {
  const folderName = route?.params?.folderName || '';
  const selectedParts = route?.params?.selectedParts || [];
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [reviewStatus, setReviewStatus] = useState<('understood' | 'review_again')[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadExamData(folderName, selectedParts);
      setExamData(data);
      
      const questions: Question[] = [];
      data.parts.forEach(part => {
        questions.push(...part.questions);
      });
      
      setAllQuestions(questions);
      setReviewStatus(new Array(questions.length).fill('review_again'));
    } catch (error) {
      alert('오류: 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnderstood = () => {
    const newStatus = [...reviewStatus];
    newStatus[currentQuestionIndex] = 'understood';
    setReviewStatus(newStatus);
    goToNextQuestion(newStatus);
  };

  const handleReviewAgain = () => {
    const newStatus = [...reviewStatus];
    newStatus[currentQuestionIndex] = 'review_again';
    setReviewStatus(newStatus);
    goToNextQuestion(newStatus);
  };

  const goToNextQuestion = (updatedStatus?: ('understood' | 'review_again')[]) => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      showResults(updatedStatus);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const showResults = (updatedStatus?: ('understood' | 'review_again')[]) => {
    // Use the updated status if provided, otherwise use current state
    const currentReviewStatus = updatedStatus || reviewStatus;
    const understoodCount = currentReviewStatus.filter(status => status === 'understood').length;
    const reviewAgainCount = currentReviewStatus.filter(status => status === 'review_again').length;

    const result = confirm(
      `학습 완료!\n총 ${allQuestions.length}개 문제\n이해함: ${understoodCount}개\n다시 보기: ${reviewAgainCount}개\n\n다시 보기 문제만 보시겠습니까?`
    );

    if (result && reviewAgainCount > 0) {
      showOnlyReviewQuestions(currentReviewStatus);
    } else {
      navigation.popToTop();
    }
  };

  const showOnlyReviewQuestions = (currentReviewStatus?: ('understood' | 'review_again')[]) => {
    const statusToUse = currentReviewStatus || reviewStatus;
    const reviewQuestions = allQuestions.filter((_, index) => 
      statusToUse[index] === 'review_again'
    );
    
    if (reviewQuestions.length === 0) {
      alert('다시 볼 문제가 없습니다.');
      navigation.popToTop();
      return;
    }

    setAllQuestions(reviewQuestions);
    setCurrentQuestionIndex(0);
    setReviewStatus(new Array(reviewQuestions.length).fill('review_again'));
  };

  if (loading) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }, '문제를 불러오는 중...');
  }

  if (!examData || allQuestions.length === 0) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }, '문제가 없습니다.');
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const options = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4,
  ];

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
        key: 'progress',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#4CAF50',
          marginBottom: '5px'
        }
      }, `${currentQuestionIndex + 1} / ${allQuestions.length}`),
      React.createElement('div', {
        key: 'folder',
        style: {
          fontSize: '14px',
          textAlign: 'center',
          color: '#666'
        }
      }, folderName)
    ]),

    // Content
    React.createElement('div', {
      key: 'content',
      style: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }
    }, [
      // Question
      React.createElement('div', {
        key: 'question',
        style: {
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }, React.createElement('p', {
        style: {
          fontSize: '16px',
          lineHeight: '24px',
          color: '#333',
          margin: 0
        }
      }, currentQuestion.question)),

      // Options
      React.createElement('div', {
        key: 'options',
        style: { marginBottom: '20px' }
      }, options.map((option, index) =>
        React.createElement('div', {
          key: index,
          style: {
            backgroundColor: index + 1 === currentQuestion.answer ? '#e8f5e8' : '#fff',
            border: index + 1 === currentQuestion.answer ? '2px solid #4CAF50' : '1px solid #eee',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center'
          }
        }, [
          React.createElement('span', {
            key: 'number',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              marginRight: '10px',
              color: '#666',
              minWidth: '20px'
            }
          }, `${index + 1}.`),
          React.createElement('span', {
            key: 'text',
            style: {
              fontSize: '16px',
              flex: 1,
              color: index + 1 === currentQuestion.answer ? '#2E7D32' : '#333',
              fontWeight: index + 1 === currentQuestion.answer ? 'bold' : 'normal'
            }
          }, option),
          index + 1 === currentQuestion.answer && React.createElement('span', {
            key: 'mark',
            style: {
              fontSize: '18px',
              color: '#4CAF50',
              fontWeight: 'bold'
            }
          }, '✓')
        ])
      )),

      // Explanation
      React.createElement('div', {
        key: 'explanation',
        style: {
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }, [
        React.createElement('h3', {
          key: 'title',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
            margin: '0 0 10px 0'
          }
        }, '해설'),
        React.createElement('p', {
          key: 'text',
          style: {
            fontSize: '16px',
            lineHeight: '24px',
            color: '#666',
            margin: 0
          }
        }, currentQuestion.explanation)
      ])
    ]),

    // Buttons
    React.createElement('div', {
      key: 'buttons',
      style: {
        padding: '20px',
        display: 'flex',
        gap: '10px',
        maxWidth: '800px',
        margin: '0 auto'
      }
    }, [
      React.createElement('button', {
        key: 'prev',
        onClick: goToPreviousQuestion,
        disabled: currentQuestionIndex === 0,
        style: {
          flex: 1,
          backgroundColor: currentQuestionIndex === 0 ? '#f5f5f5' : '#fff',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #ddd',
          fontSize: '16px',
          color: '#666',
          cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
        }
      }, '이전'),

      React.createElement('button', {
        key: 'again',
        onClick: handleReviewAgain,
        style: {
          flex: 1,
          padding: '15px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#FF9800',
          cursor: 'pointer'
        }
      }, '다시 보기'),

      React.createElement('button', {
        key: 'understood',
        onClick: handleUnderstood,
        style: {
          flex: 1,
          padding: '15px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#4CAF50',
          cursor: 'pointer'
        }
      }, '이해함')
    ])
  ]);
};

export default ReviewModeScreen;