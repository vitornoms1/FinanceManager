import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Income from '../components/Income';
import FinanceChart from '../components/FinanceChart';
import Expenses from '../components/Expenses';
import Bills from '../components/Bills';
import Investments from '../components/Investments';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios'; 

function Dashboard() {
  const { logout } = useAuth();
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [income, setIncome] = useState(0); 
  const [expenses, setExpenses] = useState([]); 
  const [bills, setBills] = useState([]); 
  const [investments, setInvestments] = useState([]);

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
      const res = await api.get('/expenses');
      setExpenses(res.data.map(item => ({ ...item, amount: Number(item.amount) })));
    } catch (error) { console.error("Erro ao buscar gastos:", error); }
  };

  const fetchBills = async () => {
    try {
      const res = await api.get('/bills');
      const formattedData = res.data.map(item => ({
        ...item,
        totalAmount: Number(item.totalAmount || item.total_amount || 0),
        totalInstallments: Number(item.totalInstallments || item.total_installments || 0),
        paidInstallments: Number(item.paidInstallments || item.paid_installments || 0),
        lastPaymentDate: item.lastPaymentDate
      }));
      setBills(formattedData);
    } catch (error) { console.error("Erro ao buscar contas:", error); }
  };

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/investments');
      setInvestments(res.data.map(item => ({ ...item, amount: Number(item.amount) })));
    } catch (error) { console.error("Erro ao buscar investimentos:", error); }
  };

  const fetchIncome = async () => {
    try {
      const res = await api.get(`/incomes?month=${selectedMonth}&year=${selectedYear}`);
      setIncome(Number(res.data.amount || 0));
    } catch (error) { console.error("Erro ao buscar renda:", error); }
  };

  // --- POST ---
  const handleSetIncome = async (newAmount) => {
    try {
      await api.post('/incomes', { amount: newAmount, month: selectedMonth, year: selectedYear });
      setIncome(newAmount); 
    } catch (error) { console.error("Erro ao salvar renda:", error); }
  };

  const addExpense = async (newExpense) => {
    try {
      await api.post('/expenses', newExpense);
      await fetchExpenses(); 
    } catch (error) { console.error("Erro ao salvar gasto:", error); }
  };

  const addBill = async (newBill) => {
    try {
      await api.post('/bills', newBill);
      await fetchBills();
    } catch (error) { console.error("Erro ao salvar conta:", error); }
  };

  const addInvestment = async (newInv) => {
    try {
      await api.post('/investments', newInv);
      await fetchInvestments();
    } catch (error) { console.error("Erro ao salvar investimento:", error); }
  };

  // --- PUT ---
  const editExpense = async (updatedExpense) => {
    try {
      await api.put(`/expenses/${updatedExpense.id}`, updatedExpense);
      setExpenses(prev => prev.map(item => item.id === updatedExpense.id ? updatedExpense : item));
    } catch (error) { console.error("Erro ao editar gasto:", error); }
  };

  const editBill = async (updatedBill) => {
    try {
      await api.put(`/bills/${updatedBill.id}`, updatedBill);
      setBills(prev => prev.map(item => item.id === updatedBill.id ? updatedBill : item));
    } catch (error) { console.error("Erro ao editar conta:", error); }
  };

  const editInvestment = async (updatedInv) => {
    try {
      await api.put(`/investments/${updatedInv.id}`, updatedInv);
      setInvestments(prev => prev.map(item => item.id === updatedInv.id ? updatedInv : item));
    } catch (error) { console.error("Erro ao editar investimento:", error); }
  };

  // --- PATCH (PAGAR CONTA) ---
  const payBillInstallment = async (id) => {
    try {
      const paymentDate = new Date(selectedYear, selectedMonth, 10);
      const res = await api.patch(`/bills/${id}/pay`, { date: paymentDate.toISOString() });
      
      const updatedBill = res.data;
      const formattedBill = { 
        ...updatedBill, 
        totalAmount: Number(updatedBill.totalAmount || updatedBill.total_amount || 0),
        totalInstallments: Number(updatedBill.totalInstallments || updatedBill.total_installments || 0),
        paidInstallments: Number(updatedBill.paidInstallments || updatedBill.paid_installments || 0),
        lastPaymentDate: updatedBill.lastPaymentDate
      };
      setBills(prev => prev.map(item => item.id === id ? formattedBill : item));
    } catch (error) { console.error("Erro ao pagar parcela:", error); }
  };

  // --- DELETE ---
  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) { console.error("Erro ao deletar gasto:", error); }
  };

  const deleteBill = async (id) => {
    try {
      await api.delete(`/bills/${id}`);
      setBills(prev => prev.filter(bill => bill.id !== id));
    } catch (error) { console.error("Erro ao deletar conta:", error); }
  };

  const deleteInvestment = async (id) => {
    try {
      await api.delete(`/investments/${id}`);
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
    <div className="bg-slate-100 min-h-screen w-full flex flex-col">
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="col-span-1 flex flex-col gap-6">
            <Header selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            <Income onSetIncome={handleSetIncome} />
            <Investments investments={investments} onAddInvestment={addInvestment} onDeleteInvestment={deleteInvestment} onEditInvestment={editInvestment} />
          </div>
          <div className="col-span-1 flex flex-col gap-6">
            <FinanceChart income={income} expenses={filteredExpenses} bills={bills} investments={filteredInvestments} selectedMonth={selectedMonth} selectedYear={selectedYear} />
            <Expenses expenses={filteredExpenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onEditExpense={editExpense} />
          </div>
          <div className="col-span-1 flex flex-col gap-6">
            <Bills bills={bills} onAddBill={addBill} onDeleteBill={deleteBill} onEditBill={editBill} onPayInstallment={payBillInstallment} selectedMonth={selectedMonth} selectedYear={selectedYear} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;