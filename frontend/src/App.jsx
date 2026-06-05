import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function DashboardWrapper() {
  const [activeSection, setActiveSection] = useState('organiser');
  const [navigationTrigger, setNavigationTrigger] = useState(null);

  const handleNavigateToContent = (hierarchy) => {
    setNavigationTrigger(hierarchy);
  };

  const handleClearNavigationTrigger = () => {
    setNavigationTrigger(null);
  };

  return (
    <ProtectedRoute>
      <Layout
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onNavigateToContent={handleNavigateToContent}
      >
        <Dashboard
          activeSection={activeSection}
          navigationTrigger={navigationTrigger}
          clearNavigationTrigger={handleClearNavigationTrigger}
        />
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="/" element={<DashboardWrapper />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
