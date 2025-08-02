import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import PartSelectionScreen from './screens/PartSelectionScreen';
import ModeSelectionScreen from './screens/ModeSelectionScreen';
import ReviewModeScreen from './screens/ReviewModeScreen';
import TestModeScreen from './screens/TestModeScreen';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/part-selection/:folderName" element={<PartSelectionScreen />} />
          <Route path="/mode-selection/:folderName/:selectedParts" element={<ModeSelectionScreen />} />
          <Route path="/review/:folderName/:selectedParts" element={<ReviewModeScreen />} />
          <Route path="/test/:folderName/:selectedParts" element={<TestModeScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;