import React, { useEffect, useState } from 'react';
import { Store, AlertCircle, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Badge } from '../components/UI';
import { DashboardMetrics, Business, formatCurrency } from '../types';

export default function Dashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/dashboard/summary').then(res => res.json()),
            fetch('/api/businesses').then(res => res.json())
        ]).then(([summary, bizData]) => {
            setMetrics(summary.metrics);
            setSalesData(summary.salesByBusiness);
            setBusinesses(bizData);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900">Global Overview</h2>
                <p className="text-zinc-500">Enterprise management system for all your operations.</p>
            </header>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{metrics ? formatCurrency(metrics.revenue) : '0'}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Active Businesses</p>
                            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{metrics?.businesses}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Store size={20} />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Low Stock</p>
                            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{metrics?.lowStock}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-violet-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Staff Count</p>
                            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{metrics?.activeStaff}</h3>
                        </div>
                        <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                            <Users size={20} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Revenue Performance">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Recent Activity">
                    <div className="space-y-4">
                        {businesses.slice(0, 5).map(b => (
                            <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-black/5">
                                        <Store size={18} className="text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{b.name}</p>
                                        <p className="text-xs text-zinc-500">{b.type} • {b.location}</p>
                                    </div>
                                </div>
                                <Badge color="emerald">Online</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
