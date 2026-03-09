import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { Customer } from '../types';

export default function CRM() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

    const fetchCustomers = () => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => {
                setCustomers(data);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete customer?')) return;
        await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        fetchCustomers();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-black/5">
                <Input placeholder="Search customers..." className="max-w-md" />
                <Button onClick={() => setIsAddCustomerOpen(true)}>Add Customer</Button>
            </div>

            <Card>
                {isLoading ? (
                    <div className="animate-pulse">Loading customers...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5 text-sm text-zinc-500">
                                <th className="pb-4 font-medium">Customer Name</th>
                                <th className="pb-4 font-medium">Contact</th>
                                <th className="pb-4 font-medium">Loyalty Points</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id} className="border-b border-black/5 last:border-0 hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 font-medium">{c.name}</td>
                                    <td className="py-4 text-zinc-500">{c.email || c.phone || 'No contact'}</td>
                                    <td className="py-4">
                                        <Badge color="amber">{c.loyalty_points} pts</Badge>
                                    </td>
                                    <td className="py-4 text-right flex justify-end gap-2">
                                        <Button variant="outline" className="text-xs">View History</Button>
                                        <button onClick={() => handleDelete(c.id)} className="text-rose-400 hover:text-rose-600 text-sm mx-2">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-zinc-400">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </Card>

            <Modal isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} title="Add New Customer">
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    fetch('/api/customers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: formData.get('name'),
                            email: formData.get('email'),
                            phone: formData.get('phone')
                        })
                    }).then(() => {
                        setIsAddCustomerOpen(false);
                        fetchCustomers();
                    });
                }}>
                    <Input label="Full Name" name="name" required />
                    <Input label="Email Address" name="email" type="email" />
                    <Input label="Phone Number" name="phone" />
                    <Button className="w-full mt-4">Save Customer</Button>
                </form>
            </Modal>
        </div>
    );
}
