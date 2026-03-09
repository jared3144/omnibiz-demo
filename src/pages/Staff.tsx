import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Modal } from '../components/UI';
import { StaffMember, formatCurrency } from '../types';
import { useBusiness } from '../context/BusinessContext';

export default function Staff() {
    const { selectedBusiness, isLoading: isBizLoading } = useBusiness();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    const fetchStaff = async () => {
        if (!selectedBusiness) {
            setStaff([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const staffRes = await fetch(`/api/staff?businessId=${selectedBusiness.id}`).then(res => res.json());
        setStaff(staffRes);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!isBizLoading) {
            fetchStaff();
        }
    }, [selectedBusiness, isBizLoading]);

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this staff member?')) return;
        await fetch(`/api/staff/${id}`, { method: 'DELETE' });
        fetchStaff();
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-4 rounded-2xl border border-black/5">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">Staff Management</h2>
                </div>
                <Button onClick={() => setIsAddStaffOpen(true)}>Add Staff</Button>
            </header>

            {!selectedBusiness ? (
                <div className="py-12 text-center text-zinc-500">Please select a business from the sidebar to manage its staff.</div>
            ) : isLoading ? (
                <div className="animate-pulse py-12 text-center text-zinc-500">Loading staff...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map(member => (
                        <Card key={member.id}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xl uppercase">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{member.name}</h3>
                                    <p className="text-sm text-zinc-500 capitalize">{member.role}</p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t border-black/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Business</span>
                                    <span className="font-medium text-right">{selectedBusiness.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Salary</span>
                                    <span className="font-medium">{formatCurrency(member.salary)}/mo</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" className="flex-1">Edit</Button>
                                <Button
                                    onClick={() => handleDelete(member.id)}
                                    variant="outline"
                                    className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                                >
                                    Remove
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)} title="Add New Staff">
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    fetch('/api/staff', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            businessId: formData.get('businessId'),
                            name: formData.get('name'),
                            role: formData.get('role'),
                            salary: parseFloat(formData.get('salary') as string)
                        })
                    }).then(() => {
                        setIsAddStaffOpen(false);
                        fetchStaff();
                    });
                }}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Assign to Business</label>
                        <div className="p-3 bg-zinc-50 rounded-lg border border-black/5 text-zinc-900 font-medium">
                            {selectedBusiness?.name}
                        </div>
                        <input type="hidden" name="businessId" value={selectedBusiness?.id} />
                    </div>
                    <Input label="Full Name" name="name" required />
                    <Select label="Role" name="role" options={[
                        { value: 'admin', label: 'Admin' },
                        { value: 'manager', label: 'Manager' },
                        { value: 'cashier', label: 'Cashier' },
                        { value: 'staff', label: 'Staff' }
                    ]} />
                    <Input label="Monthly Salary (KSh)" name="salary" type="number" step="100" required />
                    <Button className="w-full mt-4">Save Staff</Button>
                </form>
            </Modal>
        </div>
    );
}
