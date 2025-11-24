import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/LoginPage.jsx';
import Register from './pages/RegisterPage.jsx';
import Dashboard from './pages/Dashboard.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth(); 
  
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen text-green-600 font-bold">Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
           position="top-right"
           reverseOrder={false} 
        />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;