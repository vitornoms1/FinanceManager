// src/components/Header.jsx

import React from 'react';
import { HiLogout } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

function Header({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) {
  
  const { t, toggleLanguage, language } = useLanguage();
  const { logout, user } = useAuth();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
      
      <div className="flex flex-col w-full md:w-auto items-center md:items-start text-center md:text-left">
        <h2 className="text-2xl font-bold text-green-700 leading-tight whitespace-nowrap">
          {t.welcome}, <span className="text-gray-800">{firstName}</span>
        </h2>
        <span className="text-xs text-gray-400 font-medium tracking-wide">Finance Manager</span>
      </div>

      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 shadow-sm">
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium hidden sm:inline">{t.month}:</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="p-1.5 border border-gray-300 rounded-md text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer bg-white"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-gray-300"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium hidden sm:inline">{t.year}:</span>
          <input 
            type="number" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-16 p-1.5 border border-gray-300 rounded-md text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
        {/* Idiomas */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 border border-gray-200">
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

        <button 
          onClick={logout}
          className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 p-2 rounded-lg transition-all border border-red-100 shadow-sm shrink-0"
          title={t.logoutBtn}
        >
          <HiLogout className="text-xl" />
        </button>
      </div>

    </div>
  );
}

export default Header;