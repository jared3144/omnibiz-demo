import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '../components/UI';
import { Expense, Business, formatCurrency } from '../types';

export default function Finance() {
    const [summary, setSummary] = useState({ revenue: 0, expenses: 0, profit: 0 });
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    const fetchFinanceData = async () => {
        const [sumRes, expRes, bizRes] = await Promise.all([
            fetch('/api/finance/summary').then(res => res.json()),
            fetch('/api/expenses').then(res => res.json()),
            fetch('/api/businesses').then(res => res.json())
        ]);
        setSummary(sumRes);
        setExpenses(expRes);
        setBusinesses(bizRes);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Delete this expense record?')) return;
        await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        fetchFinanceData();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Finance & Accounting</h2>
                <Button onClick={() => setIsAddExpenseOpen(true)}>Log Expense</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-600 text-white border-none shadow-xl shadow-emerald-600/20">
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(summary.revenue)}</h3>
                </Card>
                <Card className="bg-rose-600 text-white border-none shadow-xl shadow-rose-600/20">
                    <p className="text-rose-100 text-sm font-medium uppercase tracking-wider">Total Expenses</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(summary.expenses)}</h3>
                </Card>
                <Card className="bg-zinc-900 text-white border-none shadow-xl shadow-zinc-900/20">
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Net Profit</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(summary.profit)}</h3>
                </Card>
            </div>

            <Card title="Expense Records">
                {isLoading ? (
                    <div className="animate-pulse py-4">Loading expenses...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5 text-sm text-zinc-500">
                                <th className="pb-4 font-medium">Date</th>
                                <th className="pb-4 font-medium">Business</th>
                                <th className="pb-4 font-medium">Category</th>
                                <th className="pb-4 font-medium">Description</th>
                                <th className="pb-4 font-medium">Amount</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((exp: Expense) => (
                                <tr key={exp.id} className="border-b border-black/5 last:border-0 hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 text-zinc-600">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="py-4 font-medium">
                                        {businesses.find(b => b.id === exp.business_id)?.name || 'Unknown'}
                                    </td>
                                    <td className="py-4">
                                        <Badge color="amber">{exp.category}</Badge>
                                    </td>
                                    <td className="py-4 text-zinc-600">{exp.description}</td>
                                    <td className="py-4 font-bold text-rose-600">-{formatCurrency(exp.amount)}</td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-rose-400 hover:text-rose-600 text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-500">No expenses recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </Card>

            <Modal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Log New Expense">
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    fetch('/api/expenses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            businessId: formData.get('businessId'),
                            category: formData.get('category'),
                            amount: parseFloat(formData.get('amount') as string),
                            description: formData.get('description')
                        })
                    }).then(() => {
                        setIsAddExpenseOpen(false);
                        fetchFinanceData();
                    });
                }}>
                    <Select label="Select Business" name="businessId" options={businesses.map(b => ({ value: b.id, label: b.name }))} required />
                    <Input label="Category (e.g., Utility, Salaries, Equipment)" name="category" required />
                    <Input label="Amount (KSh)" name="amount" type="number" step="0.01" required />
                    <Input label="Description" name="description" />
                    <Button className="w-full mt-4">Save Expense</Button>
                </form>
            </Modal>
        </div>
    );
}
