import React, { useEffect, useState } from 'react';
import { Card, Button, Select } from '../components/UI';
import { Trash2, ShoppingCart } from 'lucide-react';
import { InventoryItem, formatCurrency } from '../types';
import { useBusiness } from '../context/BusinessContext';

export default function Sales() {
    const { selectedBusiness, isLoading: isBizLoading } = useBusiness();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [cart, setCart] = useState<{ item: InventoryItem; qty: number }[]>([]);

    const fetchPosData = async () => {
        if (!selectedBusiness) {
            setInventory([]);
            return;
        }
        const invRes = await fetch(`/api/inventory?businessId=${selectedBusiness.id}`).then(res => res.json());
        setInventory(invRes);
    };

    useEffect(() => {
        if (!isBizLoading) {
            fetchPosData();
            setCart([]); // Reset POS cart on business change
        }
    }, [selectedBusiness, isBizLoading]);

    const handleAddSale = async () => {
        if (!selectedBusiness || cart.length === 0) return;
        const total = cart.reduce((sum, c) => sum + (c.item.price * c.qty), 0);
        await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId: selectedBusiness.id, amount: total, paymentMethod: 'Cash' })
        });

        // Loop through cart to deduct inventory quantities correctly
        for (const item of cart) {
            await fetch(`/api/inventory/${item.item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item.item, quantity: item.item.quantity - item.qty })
            });
        }

        setCart([]);
        alert('Sale processed successfully!');
        fetchPosData(); // Refresh UI stock ideally
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Point of Sale">
                    {!selectedBusiness ? (
                        <div className="py-12 text-center text-zinc-500">Please select a business terminal from the sidebar to start billing.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {inventory.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.quantity === 0) return; // Cannot add empty stock
                                        const existing = cart.find(c => c.item.id === item.id);
                                        if (existing && existing.qty < item.quantity) {
                                            setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
                                        } else if (!existing) {
                                            setCart([...cart, { item, qty: 1 }]);
                                        }
                                    }}
                                    className="p-4 rounded-2xl border border-black/5 bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={item.quantity === 0}
                                >
                                    <p className="font-bold text-zinc-900 group-hover:text-emerald-700">{item.name}</p>
                                    <p className="text-sm text-zinc-500">{formatCurrency(item.price)}</p>
                                    <p className="text-xs text-zinc-400 mt-2">Stock: {item.quantity}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Current Cart" className="sticky top-8">
                    <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto pr-2">
                        {cart.map(c => (
                            <div key={c.item.id} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                                <div>
                                    <p className="font-medium text-zinc-900">{c.item.name}</p>
                                    <p className="text-xs text-zinc-500">{formatCurrency(c.item.price)} x {c.qty}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold">{formatCurrency((c.item.price * c.qty))}</p>
                                    <button
                                        onClick={() => setCart(cart.filter(x => x.item.id !== c.item.id))}
                                        className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                <ShoppingCart size={48} className="mb-2 opacity-20" />
                                <p>Cart is empty</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-black/5 space-y-4 bg-white">
                        <div className="flex justify-between text-zinc-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(cart.reduce((s, c) => s + (c.item.price * c.qty), 0))}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-zinc-900">
                            <span>Total</span>
                            <span>{formatCurrency(cart.reduce((s, c) => s + (c.item.price * c.qty), 0))}</span>
                        </div>
                        <Button
                            className="w-full py-4 text-lg mt-4"
                            disabled={cart.length === 0 || !selectedBusiness}
                            onClick={handleAddSale}
                        >
                            Process Payment
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
