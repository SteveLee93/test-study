import React, { useState } from 'react';

interface PartInfo {
  number: number;
  name: string;
  description: string;
}

const PARTS: PartInfo[] = [
  { number: 1, name: '1과목', description: '소프트웨어 설계' },
  { number: 2, name: '2과목', description: '소프트웨어 개발' },
  { number: 3, name: '3과목', description: '데이터베이스 구축' },
  { number: 4, name: '4과목', description: '프로그래밍 언어 활용' },
  { number: 5, name: '5과목', description: '정보시스템 구축관리' },
];

interface PartSelectionScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
  route: {
    params: {
      folderName: string;
    };
  };
}

const PartSelectionScreen: React.FC<PartSelectionScreenProps> = ({ navigation, route }) => {
  const { folderName } = route.params;
  const [selectedParts, setSelectedParts] = useState<number[]>([]);

  const togglePart = (partNumber: number) => {
    setSelectedParts(prev => {
      if (prev.includes(partNumber)) {
        return prev.filter(p => p !== partNumber);
      } else {
        return [...prev, partNumber].sort();
      }
    });
  };

  const handleNext = () => {
    if (selectedParts.length === 0) {
      alert('최소 하나의 과목을 선택해주세요.');
      return;
    }

    navigation.navigate('ModeSelection', { folderName, selectedParts });
  };

  const renderPartItem = (part: PartInfo) => {
    const isSelected = selectedParts.includes(part.number);

    return React.createElement('button', {
      key: part.number,
      onClick: () => togglePart(part.number),
      style: {
        width: '100%',
        padding: '20px',
        marginBottom: '15px',
        backgroundColor: isSelected ? '#f8fff8' : '#fff',
        border: isSelected ? '2px solid #4CAF50' : '2px solid transparent',
        borderRadius: '10px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, [
      React.createElement('div', { key: 'content' }, [
        React.createElement('div', {
          key: 'name',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: isSelected ? '#4CAF50' : '#333',
            marginBottom: '5px'
          }
        }, part.name),
        React.createElement('div', {
          key: 'description', 
          style: {
            fontSize: '14px',
            color: isSelected ? '#4CAF50' : '#666'
          }
        }, part.description)
      ]),
      React.createElement('div', {
        key: 'checkbox',
        style: {
          width: '24px',
          height: '24px',
          border: `2px solid ${isSelected ? '#4CAF50' : '#ddd'}`,
          borderRadius: '4px',
          backgroundColor: isSelected ? '#4CAF50' : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      }, isSelected ? '✓' : '')
    ]);
  };

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '10px',
        color: '#333'
      }
    }, folderName || ''),
    React.createElement('p', {
      key: 'subtitle',
      style: {
        fontSize: '16px',
        textAlign: 'center',
        marginBottom: '30px',
        color: '#666'
      }
    }, '학습할 과목을 선택하세요 (복수 선택 가능)'),
    React.createElement('div', {
      key: 'parts',
      style: { marginBottom: '30px' }
    }, PARTS.map(renderPartItem)),
    React.createElement('div', {
      key: 'footer',
      style: {
        paddingTop: '20px',
        borderTop: '1px solid #eee'
      }
    }, [
      React.createElement('p', {
        key: 'count',
        style: {
          fontSize: '16px',
          textAlign: 'center',
          marginBottom: '15px',
          color: '#666'
        }
      }, `선택된 과목: ${selectedParts.length}개`),
      React.createElement('button', {
        key: 'next',
        onClick: handleNext,
        disabled: selectedParts.length === 0,
        style: {
          width: '100%',
          backgroundColor: selectedParts.length === 0 ? '#ccc' : '#4CAF50',
          color: '#fff',
          padding: '15px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: selectedParts.length === 0 ? 'not-allowed' : 'pointer'
        }
      }, '다음')
    ])
  ]);
};

export default PartSelectionScreen;