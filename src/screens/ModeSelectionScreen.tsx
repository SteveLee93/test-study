import React from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../App';

type ModeSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ModeSelection'
>;
type ModeSelectionScreenRouteProp = RouteProp<
  RootStackParamList,
  'ModeSelection'
>;

interface Props {
  navigation: ModeSelectionScreenNavigationProp;
  route: ModeSelectionScreenRouteProp;
}

interface ModeInfo {
  mode: 'review' | 'test';
  title: string;
  description: string;
  icon: string;
}

const MODES: ModeInfo[] = [
  {
    mode: 'review',
    title: '해설 보기',
    description: '문제와 정답, 해설을 함께 확인하며 학습합니다.',
    icon: '📖',
  },
  {
    mode: 'test',
    title: '테스트',
    description: '실제 시험처럼 문제를 풀고 점수를 확인합니다.',
    icon: '✏️',
  },
];

const ModeSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const folderName = route?.params?.folderName || '';
  const selectedParts = route?.params?.selectedParts || [];

  const handleModeSelect = (mode: 'review' | 'test') => {
    if (mode === 'review') {
      navigation.navigate('ReviewMode', {
        folderName,
        selectedParts,
      });
    } else {
      navigation.navigate('TestMode', {
        folderName,
        selectedParts,
      });
    }
  };

  const getSelectedPartsText = () => {
    return selectedParts.map((part: number) => `${part}과목`).join(', ');
  };

  const renderModeItem = (modeInfo: ModeInfo) => (
    React.createElement('button', {
      key: modeInfo.mode,
      onClick: () => handleModeSelect(modeInfo.mode),
      style: {
        width: '100%',
        backgroundColor: '#fff',
        padding: '20px',
        marginBottom: '15px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center'
      }
    }, [
      React.createElement('div', {
        key: 'icon',
        style: {
          fontSize: '30px',
          marginRight: '15px'
        }
      }, modeInfo.icon),
      React.createElement('div', {
        key: 'text',
        style: { flex: 1 }
      }, [
        React.createElement('div', {
          key: 'title',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '5px'
          }
        }, modeInfo.title),
        React.createElement('div', {
          key: 'description',
          style: {
            fontSize: '14px',
            color: '#666',
            lineHeight: '20px'
          }
        }, modeInfo.description)
      ]),
      React.createElement('div', {
        key: 'arrow',
        style: {
          fontSize: '18px',
          color: '#4CAF50',
          marginLeft: '10px'
        }
      }, '▶')
    ])
  );

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
        marginBottom: '20px',
        color: '#333'
      }
    }, '학습 모드 선택'),
    
    React.createElement('div', {
      key: 'info',
      style: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('div', {
        key: 'folder',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          marginBottom: '5px'
        }
      }, folderName),
      React.createElement('div', {
        key: 'parts',
        style: {
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }
      }, `선택된 과목: ${getSelectedPartsText()}`)
    ]),

    React.createElement('div', {
      key: 'modes',
      style: { marginBottom: '30px' }
    }, MODES.map(renderModeItem)),

    React.createElement('div', {
      key: 'footer',
      style: {
        paddingTop: '20px',
        borderTop: '1px solid #eee'
      }
    }, React.createElement('div', {
      style: {
        fontSize: '16px',
        textAlign: 'center',
        color: '#666'
      }
    }, '원하는 학습 방식을 선택해주세요'))
  ]);
};

export default ModeSelectionScreen;