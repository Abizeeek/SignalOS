import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { DollarSign, Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  timestamp: string;
}

export function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetchWithAuth('/transactions');
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    }
  };

  const currentBalance = transactions.reduce((acc, curr) => 
    curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount, 0);

  const totalIncome = transactions.reduce((acc, curr) => 
    curr.type === 'INCOME' ? acc + curr.amount : acc, 0);

  const totalExpense = transactions.reduce((acc, curr) => 
    curr.type === 'EXPENSE' ? acc + curr.amount : acc, 0);

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    setLoading(true);
    const newTx = {
      id: `tx${Date.now()}`,
      description,
      amount: parseFloat(amount),
      type,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetchWithAuth('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (res.ok) {
        setDescription('');
        setAmount('');
        console.log("Transaction saved successfully");
        fetchTransactions();
      } else {
        console.error("Server returned error", await res.text());
      }
    } catch (e) {
      console.error('Failed to add transaction', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (e) {
      console.error('Failed to delete transaction', id, e);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
            Financial Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Track your income and expenses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Total Balance</h3>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Wallet size={20} />
            </div>
          </div>
          <p className={`text-4xl font-bold tracking-tight ${currentBalance >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
            ${currentBalance.toFixed(2)}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Total Income</h3>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-4xl font-bold text-emerald-400 tracking-tight">
            ${totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Total Expenses</h3>
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-4xl font-bold text-rose-400 tracking-tight">
            ${totalExpense.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Plus className="text-indigo-400" size={24} />
              Add Transaction
            </h3>
            
            <form onSubmit={addTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
                      type === 'INCOME' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-white/5 text-slate-400 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <TrendingUp size={16} /> Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
                      type === 'EXPENSE' 
                        ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                        : 'bg-white/5 text-slate-400 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <TrendingDown size={16} /> Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 mt-4">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="E.g., Salary, Groceries..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !description || !amount}
                className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    Save Transaction
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={24} />
              Recent Transactions
            </h3>
            
            {transactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Wallet size={32} className="opacity-50" />
                </div>
                <p>No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px]">
                {[...transactions].reverse().map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200">{tx.description}</h4>
                        <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
