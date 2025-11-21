// src/context/LanguageContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { translations } from '../utils/translations';

// Cria o Contexto
const LanguageContext = createContext();

// Cria o Provider (o componente que vai envolver o App)
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // 'en' ou 'pt'

  // Função para trocar idioma
  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  // Função GLOBAL de formatar moeda
  // Ela muda automaticamente baseada no idioma selecionado
  const formatCurrency = (value) => {
    if (language === 'pt') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
  };

  // O que vamos entregar para os componentes
  const value = {
    language,
    toggleLanguage,
    t: translations[language], // 't' será o nosso dicionário atual
    formatCurrency
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personalizado para facilitar o uso
export function useLanguage() {
  return useContext(LanguageContext);
}