import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StartPage } from './pages/StartPage';
import { LoginPage } from './pages/LoginPage';
import { IntroPage } from './pages/IntroPage';
import { Dashboard } from './pages/Dashboard';
import { SampleRegistration } from './pages/SampleRegistration';
import { LabAnalysis } from './pages/LabAnalysis';
import { ReportView } from './pages/ReportView';
import { Compliance } from './pages/Compliance';
import { SourceMap } from './pages/SourceMap';
import { LabProvider } from './context/LabContext';

const App = () => {
  return (
    <LabProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/samples/new" element={<SampleRegistration />} />
                <Route path="/lab" element={<LabAnalysis />} />
                <Route path="/reports" element={<ReportView />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/map" element={<SourceMap />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </LabProvider>
  );
};

export default App;
