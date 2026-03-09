import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Store, Package, Users, CreditCard, TrendingUp, Settings, DollarSign, ChevronDown
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        end={to === "/"}
        to={to}
        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
            ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
            : 'text-zinc-500 hover:bg-zinc-100'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </NavLink>
);

export default function Layout() {
    const { businesses, selectedBusiness, setSelectedBusiness, isLoading } = useBusiness();

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex">
            <aside className="w-64 bg-white border-r border-black/5 flex flex-col h-screen overflow-hidden sticky top-0">
                <div className="p-6 pb-2 border-b border-black/5">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">O</div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900">OmniBiz</h1>
                    </div>

                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 pr-8 font-medium cursor-pointer transition-colors hover:bg-zinc-100"
                            value={selectedBusiness?.id || ""}
                            onChange={(e) => {
                                const biz = businesses.find(b => b.id === e.target.value);
                                if (biz) setSelectedBusiness(biz);
                            }}
                            disabled={isLoading || businesses.length === 0}
                        >
                            {isLoading ? (
                                <option>Loading...</option>
                            ) : businesses.length === 0 ? (
                                <option>No businesses found</option>
                            ) : (
                                businesses.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))
                            )}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-3 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/businesses" icon={Store} label="Businesses" />
                    <SidebarItem to="/inventory" icon={Package} label="Inventory" />
                    <SidebarItem to="/staff" icon={Users} label="Staff & Roles" />
                    <SidebarItem to="/sales" icon={CreditCard} label="POS & Sales" />
                    <SidebarItem to="/crm" icon={Users} label="CRM" />
                    <SidebarItem to="/finance" icon={DollarSign} label="Finance" />
                    <SidebarItem to="/reports" icon={TrendingUp} label="Reports" />
                </nav>

                <div className="pt-6 border-t border-black/5">
                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
