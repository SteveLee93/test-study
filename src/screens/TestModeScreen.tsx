import React, {useState, useEffect} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../App';
import {loadExamData} from '../utils/csvParser';
import {Question, ExamData} from '../types/Question';

type TestModeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TestMode'
>;
type TestModeScreenRouteProp = RouteProp<RootStackParamList, 'TestMode'>;

interface Props {
  navigation: TestModeScreenNavigationProp;
  route: TestModeScreenRouteProp;
}

type TestState = 'answering' | 'showing_result' | 'completed';

const TestModeScreen: React.FC<Props> = ({navigation, route}) => {
  const {folderName, selectedParts} = route.params;
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testState, setTestState] = useState<TestState>('answering');
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
      setSelectedAnswers(new Array(questions.length).fill(0));
    } catch (error) {
      alert('오류: 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerNumber: number) => {
    if (testState !== 'answering') return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerNumber;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] === 0) {
      alert('답을 선택해주세요.');
      return;
    }

    setTestState('showing_result');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTestState('answering');
    } else {
      showFinalResults();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTestState('answering');
    }
  };

  const showFinalResults = () => {
    setTestState('completed');
    
    const correctCount = allQuestions.reduce((count, question, index) => {
      return count + (selectedAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    const percentage = Math.round((correctCount / allQuestions.length) * 100);

    const result = confirm(
      `테스트 완료\n총 ${allQuestions.length}문제 중 ${correctCount}문제 정답\n정답률: ${percentage}%\n\n오답 노트를 보시겠습니까?`
    );

    if (result) {
      showWrongAnswersOnly();
    } else {
      navigation.popToTop();
    }
  };

  const showWrongAnswersOnly = () => {
    const wrongQuestions = allQuestions.filter((question, index) => 
      selectedAnswers[index] !== question.answer
    );
    
    if (wrongQuestions.length === 0) {
      alert('축하합니다! 모든 문제를 맞혔습니다!');
      navigation.popToTop();
      return;
    }

    setAllQuestions(wrongQuestions);
    setCurrentQuestionIndex(0);
    setTestState('showing_result');
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
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;

  const getOptionStyle = (optionNumber: number) => {
    const baseStyle = {
      backgroundColor: '#fff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      cursor: testState === 'answering' ? 'pointer' : 'default',
      border: '1px solid #eee'
    };

    if (testState === 'answering') {
      if (selectedAnswer === optionNumber) {
        return { ...baseStyle, backgroundColor: '#e3f2fd', border: '2px solid #2196F3' };
      }
      return baseStyle;
    } else {
      if (optionNumber === currentQuestion.answer) {
        return { ...baseStyle, backgroundColor: '#e8f5e8', border: '2px solid #4CAF50' };
      } else if (optionNumber === selectedAnswer && !isCorrect) {
        return { ...baseStyle, backgroundColor: '#ffebee', border: '2px solid #f44336' };
      } else {
        return baseStyle;
      }
    }
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
      }, folderName),
      testState === 'showing_result' && React.createElement('div', {
        key: 'result',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '10px',
          color: isCorrect ? '#4CAF50' : '#f44336'
        }
      }, isCorrect ? '정답!' : '오답')
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
        React.createElement('button', {
          key: index,
          onClick: testState === 'answering' ? () => handleAnswerSelect(index + 1) : undefined,
          disabled: testState !== 'answering',
          style: getOptionStyle(index + 1)
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
              color: testState === 'answering' 
                ? (selectedAnswer === index + 1 ? '#1976D2' : '#333')
                : (index + 1 === currentQuestion.answer ? '#2E7D32' : 
                   (index + 1 === selectedAnswer && !isCorrect ? '#c62828' : '#333')),
              fontWeight: testState === 'answering' 
                ? (selectedAnswer === index + 1 ? 'bold' : 'normal')
                : (index + 1 === currentQuestion.answer || (index + 1 === selectedAnswer && !isCorrect) ? 'bold' : 'normal')
            }
          }, option),
          testState === 'showing_result' && index + 1 === currentQuestion.answer && React.createElement('span', {
            key: 'correct',
            style: {
              fontSize: '18px',
              color: '#4CAF50',
              fontWeight: 'bold'
            }
          }, '✓'),
          testState === 'showing_result' && index + 1 === selectedAnswer && !isCorrect && React.createElement('span', {
            key: 'wrong',
            style: {
              fontSize: '18px',
              color: '#f44336',
              fontWeight: 'bold'
            }
          }, '✗')
        ])
      )),

      // Explanation
      testState === 'showing_result' && React.createElement('div', {
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
    }, testState === 'answering' ? [
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
        key: 'submit',
        onClick: handleSubmitAnswer,
        disabled: selectedAnswer === 0,
        style: {
          flex: 2,
          backgroundColor: selectedAnswer === 0 ? '#f5f5f5' : '#2196F3',
          padding: '15px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          cursor: selectedAnswer === 0 ? 'not-allowed' : 'pointer'
        }
      }, '제출')
    ] : [
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
        key: 'next',
        onClick: handleNextQuestion,
        style: {
          flex: 2,
          backgroundColor: '#4CAF50',
          padding: '15px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          cursor: 'pointer'
        }
      }, currentQuestionIndex === allQuestions.length - 1 ? '완료' : '다음')
    ])
  ]);
};

export default TestModeScreen;