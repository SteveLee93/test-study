import React, {useState, useEffect} from 'react';
import { getAvailableFolders } from '../utils/csvParser';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const availableFolders = await getAvailableFolders();
        setFolders(availableFolders);
      } catch (error) {
        console.error('Error loading folders:', error);
        setFolders([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFolders();
  }, []);

  const handleFolderSelect = (folderName: string) => {
    console.log('Selected folder:', folderName);
    navigation.navigate('PartSelection', { folderName });
  };

  console.log('Rendering HomeScreen, loading:', loading, 'folders:', folders);

  if (loading) {
    return React.createElement('div', { 
      style: { 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      } 
    }, '로딩 중...');
  }

  const folderButtons = folders.map((folder) =>
    React.createElement('button', {
      key: folder,
      onClick: () => handleFolderSelect(folder),
      style: {
        display: 'block',
        width: '100%',
        padding: '20px',
        margin: '10px 0',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
      }
    }, folder)
  );

  return React.createElement('div', {
    style: {
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: { textAlign: 'center', marginBottom: '30px' }
    }, 'CBT 정보처리기사'),
    React.createElement('p', {
      key: 'subtitle',
      style: { textAlign: 'center', marginBottom: '30px' }
    }, '학습할 년도/회차를 선택하세요'),
    React.createElement('div', {
      key: 'actionButtons',
      style: { 
        textAlign: 'center', 
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }
    }, [
      React.createElement('button', {
        key: 'results',
        onClick: () => navigation.navigate('TestResults'),
        style: {
          padding: '12px 24px',
          backgroundColor: '#2196F3',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }
      }, '📊 테스트 결과'),
      React.createElement('button', {
        key: 'management',
        onClick: () => navigation.navigate('QuestionManagement'),
        style: {
          padding: '12px 24px',
          backgroundColor: '#FF9800',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }
      }, '⚙️ 문제 관리')
    ]),
    React.createElement('div', { key: 'folders' }, folderButtons)
  ]);
};

export default HomeScreen;