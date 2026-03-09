import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Modal, Badge } from '../components/UI';
import { InventoryItem, Business, formatCurrency, cn } from '../types';
import { useBusiness } from '../context/BusinessContext';

export default function Inventory() {
    const { selectedBusiness, isLoading: isBizLoading } = useBusiness();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);

    const fetchInventory = async () => {
        if (!selectedBusiness) {
            setInventory([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const invRes = await fetch(`/api/inventory?businessId=${selectedBusiness.id}`).then(res => res.json());
        setInventory(invRes);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!isBizLoading) {
            fetchInventory();
        }
    }, [selectedBusiness, isBizLoading]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        fetchInventory();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-black/5">
                <div className="flex gap-4 flex-1 max-w-xl">
                    <Input placeholder="Search inventory..." className="flex-1" />
                    <Select options={[{ value: 'all', label: 'All Categories' }]} className="w-48" />
                </div>
                <Button onClick={() => setIsAddItemOpen(true)}>Add Item</Button>
            </div>

            <Card>
                {!selectedBusiness ? (
                    <div className="py-12 text-center text-zinc-500">Please select a business from the sidebar to view its inventory.</div>
                ) : isLoading ? (
                    <div className="animate-pulse py-12 text-center text-zinc-500">Loading inventory...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5 text-sm text-zinc-500">
                                <th className="pb-4 font-medium">Product Name</th>
                                <th className="pb-4 font-medium">SKU</th>
                                <th className="pb-4 font-medium">Stock</th>
                                <th className="pb-4 font-medium">Price</th>
                                <th className="pb-4 font-medium">Status</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} className="border-b border-black/5 last:border-0 hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 font-medium">{item.name}</td>
                                    <td className="py-4 text-zinc-500">{item.sku || 'N/A'}</td>
                                    <td className="py-4">
                                        <span className={cn("font-bold", item.quantity < 10 ? "text-rose-600" : "text-zinc-900")}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="py-4 font-medium">{formatCurrency(item.price)}</td>
                                    <td className="py-4">
                                        <Badge color={item.quantity > 10 ? 'emerald' : 'rose'}>
                                            {item.quantity > 10 ? 'In Stock' : 'Low Stock'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button className="text-zinc-400 hover:text-zinc-900 mx-2">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-600">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title="Add Inventory Item">
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    fetch('/api/inventory', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            businessId: formData.get('businessId'),
                            name: formData.get('name'),
                            sku: formData.get('sku'),
                            quantity: parseInt(formData.get('quantity') as string),
                            price: parseFloat(formData.get('price') as string),
                            category: formData.get('category')
                        })
                    }).then(() => {
                        setIsAddItemOpen(false);
                        fetchInventory();
                    });
                }}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Business</label>
                        <div className="p-3 bg-zinc-50 rounded-lg border border-black/5 text-zinc-900 font-medium">
                            {selectedBusiness?.name}
                        </div>
                        <input type="hidden" name="businessId" value={selectedBusiness?.id} />
                    </div>
                    <Input label="Item Name" name="name" required />
                    <Input label="SKU" name="sku" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Quantity" name="quantity" type="number" required />
                        <Input label="Price" name="price" type="number" step="0.01" required />
                    </div>
                    <Input label="Category" name="category" />
                    <Button className="w-full mt-4">Add to Stock</Button>
                </form>
            </Modal>
        </div>
    );
}
