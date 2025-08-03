import React, {useState} from 'react';
import HomeScreen from './src/screens/HomeScreen';
import PartSelectionScreen from './src/screens/PartSelectionScreen';
import ModeSelectionScreen from './src/screens/ModeSelectionScreen';
import ReviewModeScreen from './src/screens/ReviewModeScreen';
import TestModeScreen from './src/screens/TestModeScreen';
import TestResultsScreen from './src/screens/TestResultsScreen';
import QuestionManagementScreen from './src/screens/QuestionManagementScreen';
import BrowseQuestionsScreen from './src/screens/BrowseQuestionsScreen';

type Screen = 'Home' | 'PartSelection' | 'ModeSelection' | 'ReviewMode' | 'TestMode' | 'TestResults' | 'QuestionManagement' | 'BrowseQuestions';

interface NavigationState {
  screen: Screen;
  params?: any;
}

const App = (): JSX.Element => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    screen: 'Home'
  });

  const navigate = (screen: Screen, params?: any) => {
    console.log('Navigate to:', screen, params);
    setNavigationState({ screen, params });
  };

  const goBack = () => {
    setNavigationState({ screen: 'Home' });
  };

  const mockNavigation = {
    navigate,
    goBack,
    popToTop: () => setNavigationState({ screen: 'Home' })
  };

  const renderScreen = () => {
    switch (navigationState.screen) {
      case 'Home':
        return <HomeScreen navigation={mockNavigation as any} />;
      case 'PartSelection':
        return <PartSelectionScreen 
          navigation={mockNavigation as any} 
          route={{ params: navigationState.params } as any} 
        />;
      case 'ModeSelection':
        return <ModeSelectionScreen 
          navigation={mockNavigation as any} 
          route={{ params: navigationState.params } as any} 
        />;
      case 'ReviewMode':
        return <ReviewModeScreen 
          navigation={mockNavigation as any} 
          route={{ params: navigationState.params } as any} 
        />;
      case 'TestMode':
        return <TestModeScreen 
          navigation={mockNavigation as any} 
          route={{ params: navigationState.params } as any} 
        />;
      case 'TestResults':
        return <TestResultsScreen navigation={mockNavigation as any} />;
      case 'QuestionManagement':
        return <QuestionManagementScreen navigation={mockNavigation as any} />;
      case 'BrowseQuestions':
        return <BrowseQuestionsScreen navigation={mockNavigation as any} />;
      default:
        return <HomeScreen navigation={mockNavigation as any} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {navigationState.screen !== 'Home' && navigationState.screen !== 'TestResults' && navigationState.screen !== 'QuestionManagement' && navigationState.screen !== 'BrowseQuestions' && (
        <div style={{ 
          padding: '10px 20px', 
          backgroundColor: '#fff', 
          borderBottom: '1px solid #eee',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <button 
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#4CAF50'
            }}
          >
            ← 뒤로
          </button>
        </div>
      )}
      {renderScreen()}
    </div>
  );
};

export default App;