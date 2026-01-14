// src/components/Header.jsx

import React from 'react';
import { HiLogout } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

function Header({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) {
  const { t, toggleLanguage, language } = useLanguage();
  const { logout } = useAuth();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-xl">$</span>
        </div>
        <h1 className="text-lg font-extrabold text-gray-800 tracking-tight hidden sm:block">FinanceManager</h1>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-gray-700 px-2 py-1 outline-none cursor-pointer"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          {/* Corrigido: Largura aumentada para w-20 para não cortar o ano */}
          <input 
            type="number" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-gray-700 w-20 px-2 py-1 outline-none text-center"
          />
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button onClick={() => toggleLanguage('pt')} className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${language === 'pt' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400'}`}>BR</button>
            <button onClick={() => toggleLanguage('en')} className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400'}`}>EN</button>
          </div>
          <button onClick={logout} className="p-2.5 text-red-200 hover:text-red-500 bg-red-50/30 hover:bg-red-50 rounded-xl transition-all"><HiLogout size={20} /></button>
        </div>
      </div>
    </div>
  );
}

export default Header;