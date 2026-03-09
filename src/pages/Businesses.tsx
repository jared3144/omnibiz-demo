import React, { useState } from 'react';
import { Store, Plus } from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../components/UI';
import { useBusiness } from '../context/BusinessContext';

export default function Businesses() {
    const { businesses, isLoading, refreshBusinesses } = useBusiness();
    const [isAddBizOpen, setIsAddBizOpen] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this business?')) return;
        await fetch(`/api/businesses/${id}`, { method: 'DELETE' });
        refreshBusinesses();
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">Businesses</h2>
                    <p className="text-zinc-500">Manage your branches and subsidiaries.</p>
                </div>
                <Button className="flex items-center gap-2" onClick={() => setIsAddBizOpen(true)}>
                    <Plus size={18} /> New Business
                </Button>
            </header>

            {isLoading ? (
                <div className="animate-pulse">Loading businesses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map(b => (
                        <Card key={b.id}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                    <Store size={18} className="text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-zinc-900">{b.name}</p>
                                    <p className="text-xs text-zinc-500 capitalize">{b.type}</p>
                                </div>
                                <Badge color="emerald">Active</Badge>
                            </div>
                            <div className="text-sm text-zinc-600 mb-4 font-medium">
                                Location: <span className="text-zinc-900">{b.location}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">Edit</Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 text-rose-600 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50"
                                    onClick={() => handleDelete(b.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={isAddBizOpen} onClose={() => setIsAddBizOpen(false)} title="Add New Business">
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    fetch('/api/businesses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: formData.get('name'),
                            type: formData.get('type'),
                            location: formData.get('location')
                        })
                    }).then(() => {
                        setIsAddBizOpen(false);
                        refreshBusinesses();
                    });
                }}>
                    <Input label="Business Name" name="name" required />
                    <Select label="Business Type" name="type" options={[
                        { value: 'restaurant', label: 'Restaurant' },
                        { value: 'retail', label: 'Retail' },
                        { value: 'butchery', label: 'Butchery' },
                        { value: 'service', label: 'Service' }
                    ]} />
                    <Input label="Location" name="location" required />
                    <Button className="w-full mt-4">Create Business</Button>
                </form>
            </Modal>
        </div>
    );
}
