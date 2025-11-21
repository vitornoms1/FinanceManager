// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
// Importa o contexto de idioma
import { useLanguage } from '../context/LanguageContext';

const EyeIcon = ({ onClick, isVisible }) => (
  <button 
    type="button" 
    onClick={onClick} 
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
  >
    {isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7 .946-3.11 3.522-5.44 6.837-6.108M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.58 4.42a1.5 1.5 0 012.08 2.08L4.5 21.58A1.5 1.5 0 012.42 19.5L17.58 4.42z" /></svg>
    )}
  </button>
);

const Register = () => {
  const { t, toggleLanguage, language } = useLanguage(); // Hook de idioma
  const { register, authLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setPassError(t.passLengthError);
      return;
    }
    if (password !== confirmPassword) {
      setPassError(t.passMatchError);
      return;
    }
    setPassError('');

    try {
      await register(name, email, password);
    } catch (err) {
      console.error("Erro no registro:", err);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <div className="min-h-screen flex relative">
      
      {/* Botões de Idioma Flutuantes */}
      <div className="absolute top-4 right-4 z-50 flex gap-1 bg-white/80 backdrop-blur p-1 rounded-lg border border-gray-200 shadow-sm">
        <button 
          onClick={() => toggleLanguage('pt')}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'pt' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
        >
          BR
        </button>
        <button 
          onClick={() => toggleLanguage('en')}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
        >
          EN
        </button>
      </div>

      {/* Lado do Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Finance Manager<span className="text-green-600">.</span>
            </h2>
            <h1 className="text-xl font-semibold text-gray-500">{t.createAccount}</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <InputField id="name" label={t.fullName} type="text" placeholder="Nome Sobrenome" required 
              value={name} onChange={(e) => setName(e.target.value)} 
            />
            <InputField id="email" label={t.email} type="email" placeholder="exemplo@email.com" required 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
            
            <InputField id="password" label={t.password} type={isPasswordVisible ? 'text' : 'password'} placeholder="••••••••" required 
              value={password} onChange={(e) => setPassword(e.target.value)} 
            >
               <EyeIcon onClick={togglePasswordVisibility} isVisible={isPasswordVisible} />
            </InputField>

            <InputField id="confirmPassword" label={t.confirmPassword} type={isPasswordVisible ? 'text' : 'password'} placeholder="••••••••" required 
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
            >
               <EyeIcon onClick={togglePasswordVisibility} isVisible={isPasswordVisible} />
            </InputField>
            
            {passError && <p className="text-red-500 text-sm mb-4">{passError}</p>}
            {error && <p className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <button type="submit" disabled={authLoading} className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-300 disabled:bg-gray-400 mt-2">
              {authLoading ? t.creatingAccount : t.signUpBtn} 
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            {t.haveAccount}{' '}
            <Link to="/login" className="text-green-600 hover:underline font-semibold">
              {t.clickLogin}
            </Link>
          </p>
        </div>
      </div>
      
      {/* Lado da Imagem */}
      <div className="hidden md:flex w-1/2 bg-green-900 flex-col items-center justify-center text-white p-12">
        <h2 className="text-4xl font-bold mb-4 text-center">{t.registerTitle}</h2>
        <p className="text-green-200 text-center text-lg max-w-md">{t.registerSubtitle}</p>
      </div>
    </div>
  );
};

export default Register;