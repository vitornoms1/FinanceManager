// src/components/FinanceChart.jsx

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { HiChartPie } from 'react-icons/hi';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend);

// Recebemos selectedMonth e selectedYear agora
function FinanceChart({ income, expenses, bills, investments = [], selectedMonth, selectedYear }) {
  const { t, formatCurrency } = useLanguage();

  // 1. Soma Gastos Variáveis (Já vêm filtrados do App.jsx)
  const totalVariableExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  // 2. Soma Contas Fixas (NOVA LÓGICA)
  const totalMonthlyBills = bills.reduce((acc, bill) => {
    // Se nunca foi paga, não desconta do saldo
    if (!bill.lastPaymentDate) return acc;

    // Verifica se o pagamento foi feito no Mês e Ano selecionados
    // A data vem como 'YYYY-MM-DD' (string)
    const [pYear, pMonth] = bill.lastPaymentDate.split('-');
    
    // pMonth é "01", "02"... selectedMonth é 0, 1...
    const paymentMonthIndex = parseInt(pMonth) - 1;
    const paymentYear = parseInt(pYear);

    if (paymentMonthIndex === selectedMonth && paymentYear === selectedYear) {
      // Se foi paga neste mês, calcula o valor da parcela e soma
      const monthlyCost = bill.totalAmount / bill.totalInstallments;
      return acc + monthlyCost;
    }

    // Se não foi paga neste mês, ignora
    return acc;
  }, 0);

  // 3. Soma Investimentos (Mantivemos global, ou quer filtrar por mês também?)
  // Se quiser que investimentos só descontem se feitos no mês, precisaria ter data no investimento.
  // Por enquanto, vou deixar como estava (Global), mas podemos mudar.
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);

  // Nota: Investimentos geralmente são "saídas" do caixa, mas aumentam o patrimônio.
  // Se você quer que o saldo reflita "Dinheiro na conta corrente", subtrair investimentos está certo.
  
  const totalSpending = Math.abs(totalVariableExpenses) + totalMonthlyBills + totalInvested;
  const remainingBalance = income - totalSpending;

  const data = {
    labels: [t.totalSpent, t.amountRemaining],
    datasets: [
      {
        data: [ totalSpending, remainingBalance > 0 ? remainingBalance : 0 ],
        backgroundColor: ['#EF4444', '#22C55E'],
        borderColor: '#FFFFFF', borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false, cutout: '70%', 
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) label += formatCurrency(context.parsed);
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col items-center">
      <div className="flex items-center justify-between mb-4 w-full">
        <h3 className="text-xl font-semibold">{t.balanceTitle}</h3>
        <HiChartPie className="text-2xl text-green-600" />
      </div>

      {income === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">{t.pleaseSetIncome}</p>
        </div>
      ) : (
        <>
          <div className="w-full h-48 md:h-56 mb-4">
            <Doughnut data={data} options={options} />
          </div>
          <div className="text-center">
            <p className={`text-4xl font-bold ${remainingBalance < 0 ? 'text-red-600' : 'text-green-700'}`}>
              {formatCurrency(remainingBalance)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
export default FinanceChart;