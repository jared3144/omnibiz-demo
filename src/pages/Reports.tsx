import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types';
import { cn } from '../types';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/dashboard/summary').then(res => res.json()),
            fetch('/api/inventory').then(res => res.json())
        ]).then(([summary, inv]) => {
            setSalesData(summary.salesByBusiness);
            setInventory(inv);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-zinc-900">Analytics & Reports</h2>
                <p className="text-zinc-500">Business insights and analytical reporting.</p>
            </header>

            {isLoading ? (
                <div className="animate-pulse">Generating reports...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Sales by Category">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={salesData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {salesData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card title="Inventory Distribution">
                        <div className="space-y-4">
                            {inventory.slice(0, 6).map(item => (
                                <div key={item.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-zinc-700">{item.name}</span>
                                        <span className="text-zinc-500">{item.quantity} units</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", item.quantity < 10 ? "bg-rose-500" : "bg-emerald-500")}
                                            style={{ width: `${Math.min(item.quantity, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
