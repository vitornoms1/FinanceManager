// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Income from '../components/Income';
import FinanceChart from '../components/FinanceChart';
import Expenses from '../components/Expenses';
import Bills from '../components/Bills';
import Investments from '../components/Investments';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { logout } = useAuth();
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [income, setIncome] = useState(0); 
  const [expenses, setExpenses] = useState([]); 
  const [bills, setBills] = useState([]); 
  const [investments, setInvestments] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchExpenses();
    fetchBills();
    fetchInvestments();
  }, []);

  useEffect(() => {
    fetchIncome();
  }, [selectedMonth, selectedYear]);

  // --- GET ---
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Falha ao buscar");
      const data = await res.json();
      const formattedData = data.map(item => ({ ...item, amount: Number(item.amount) }));
      setExpenses(formattedData);
    } catch (error) { console.error("Erro ao buscar gastos:", error); }
  };

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_URL}/bills`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Falha ao buscar");
      const data = await res.json();
      const formattedData = data.map(item => ({
        ...item,
        totalAmount: Number(item.totalAmount),
        lastPaymentDate: item.lastPaymentDate
      }));
      setBills(formattedData);
    } catch (error) { console.error("Erro ao buscar contas:", error); }
  };

  const fetchInvestments = async () => {
    try {
      const res = await fetch(`${API_URL}/investments`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Falha ao buscar");
      const data = await res.json();
      const formattedData = data.map(item => ({ ...item, amount: Number(item.amount) }));
      setInvestments(formattedData);
    } catch (error) { console.error("Erro ao buscar investimentos:", error); }
  };

  const fetchIncome = async () => {
    try {
      const res = await fetch(`${API_URL}/incomes?month=${selectedMonth}&year=${selectedYear}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Falha ao buscar");
      const data = await res.json();
      setIncome(Number(data.amount || 0));
    } catch (error) { console.error("Erro ao buscar renda:", error); }
  };

  // --- POST ---
  const handleSetIncome = async (newAmount) => {
    try {
      await fetch(`${API_URL}/incomes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: newAmount, month: selectedMonth, year: selectedYear })
      });
      setIncome(newAmount); 
    } catch (error) { console.error("Erro ao salvar renda:", error); }
  };

  const addExpense = async (newExpense) => {
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newExpense)
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      await fetchExpenses(); 
    } catch (error) { console.error("Erro ao salvar gasto:", error); }
  };

  const addBill = async (newBill) => {
    try {
      const res = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newBill)
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      await fetchBills();
    } catch (error) { console.error("Erro ao salvar conta:", error); }
  };

  const addInvestment = async (newInv) => {
    try {
      const res = await fetch(`${API_URL}/investments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newInv)
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      await fetchInvestments();
    } catch (error) { console.error("Erro ao salvar investimento:", error); }
  };

  // --- PUT ---
  const editExpense = async (updatedExpense) => {
    try {
      await fetch(`${API_URL}/expenses/${updatedExpense.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedExpense)
      });
      setExpenses(prev => prev.map(item => item.id === updatedExpense.id ? updatedExpense : item));
    } catch (error) { console.error("Erro ao editar gasto:", error); }
  };

  const editBill = async (updatedBill) => {
    try {
      await fetch(`${API_URL}/bills/${updatedBill.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedBill)
      });
      setBills(prev => prev.map(item => item.id === updatedBill.id ? updatedBill : item));
    } catch (error) { console.error("Erro ao editar conta:", error); }
  };

  const editInvestment = async (updatedInv) => {
    try {
      await fetch(`${API_URL}/investments/${updatedInv.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedInv)
      });
      setInvestments(prev => prev.map(item => item.id === updatedInv.id ? updatedInv : item));
    } catch (error) { console.error("Erro ao editar investimento:", error); }
  };

  // --- PATCH (PAGAR CONTA) ---
  const payBillInstallment = async (id) => {
    try {
      const paymentDate = new Date(selectedYear, selectedMonth, 10);

      const res = await fetch(`${API_URL}/bills/${id}/pay`, { 
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: paymentDate.toISOString() })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Erro ao pagar.");
        return;
      }
      const updatedBill = await res.json();
      const formattedBill = { 
        ...updatedBill, 
        totalAmount: Number(updatedBill.totalAmount),
        totalInstallments: Number(updatedBill.totalInstallments),
        paidInstallments: Number(updatedBill.paidInstallments),
        lastPaymentDate: updatedBill.lastPaymentDate
      };
      setBills(prev => prev.map(item => item.id === id ? formattedBill : item));
    } catch (error) { console.error("Erro ao pagar parcela:", error); }
  };

  // --- DELETE ---
  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) { console.error("Erro ao deletar gasto:", error); }
  };

  const deleteBill = async (id) => {
    try {
      await fetch(`${API_URL}/bills/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setBills(prev => prev.filter(bill => bill.id !== id));
    } catch (error) { console.error("Erro ao deletar conta:", error); }
  };

  const deleteInvestment = async (id) => {
    try {
      await fetch(`${API_URL}/investments/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setInvestments(prev => prev.filter(inv => inv.id !== id));
    } catch (error) { console.error("Erro ao deletar investimento:", error); }
  };

  // --- FILTROS ---
  const filteredExpenses = expenses.filter(expense => {
    if (!expense.date) return false;
    const [year, month] = expense.date.split('-');
    return parseInt(year) === selectedYear && (parseInt(month) - 1) === selectedMonth;
  });

  const filteredInvestments = investments.filter(inv => {
    if (!inv.date) return false; 
    const [year, month] = inv.date.split('-');
    return parseInt(year) === selectedYear && (parseInt(month) - 1) === selectedMonth;
  });

  return (
    <div className="bg-slate-100 min-h-screen lg:h-screen w-full flex flex-col lg:overflow-hidden">
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-full lg:min-h-0">

          {/* Coluna 1 */}
          <div className="col-span-1 flex flex-col gap-6 h-auto lg:h-full lg:min-h-0 lg:overflow-hidden">
            <div className="shrink-0">
              <Header selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            </div>
            <div className="shrink-0">
              <Income onSetIncome={handleSetIncome} />
            </div>
            <Investments 
              investments={investments} onAddInvestment={addInvestment} onDeleteInvestment={deleteInvestment} onEditInvestment={editInvestment}
            />
          </div>

          {/* Coluna 2 */}
          <div className="col-span-1 flex flex-col gap-6 h-auto lg:h-full lg:min-h-0 lg:overflow-hidden">
            <div className="shrink-0">
              <FinanceChart 
                income={income} expenses={filteredExpenses} bills={bills} investments={filteredInvestments} selectedMonth={selectedMonth} selectedYear={selectedYear} 
              />
            </div>
            <Expenses 
              expenses={filteredExpenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onEditExpense={editExpense} 
            />
          </div>

          {/* Coluna 3 */}
          <div className="col-span-1 flex flex-col gap-6 h-auto lg:h-full lg:min-h-0 lg:overflow-hidden">
            <Bills 
              bills={bills} 
              onAddBill={addBill} 
              onDeleteBill={deleteBill} 
              onEditBill={editBill} 
              onPayInstallment={payBillInstallment}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;