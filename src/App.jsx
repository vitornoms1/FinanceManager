// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importa o AuthProvider
import { Toaster } from 'react-hot-toast';

// Nomes limpos para as páginas
import Login from './pages/LoginPage.jsx';        // (Vamos criar a seguir)
import Register from './pages/RegisterPage.jsx';  // (Vamos criar a seguir)
import Dashboard from './pages/Dashboard.jsx';

// Componente que protege a rota (Só entra se estiver logado)
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
    // Envolvemos tudo no AuthProvider para ter acesso ao contexto de usuário
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rota Protegida: O Dashboard */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Redireciona qualquer erro para a home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;