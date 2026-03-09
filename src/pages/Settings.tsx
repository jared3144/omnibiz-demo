import React from 'react';
import { Card, Button, Input } from '../components/UI';

export default function Settings() {
    return (
        <div className="space-y-8 max-w-4xl">
            <header>
                <h2 className="text-2xl font-bold text-zinc-900">Platform Settings</h2>
                <p className="text-zinc-500">Manage your system preferences and configurations.</p>
            </header>

            <Card title="General System Configuration">
                <form className="space-y-4 max-w-lg mt-4" onSubmit={(e) => {
                    e.preventDefault();
                    alert('Settings saved successfully!');
                }}>
                    <Input label="Global Organization Name" defaultValue="Global Enterprise Corp" />
                    <Input label="Admin Email Contact" defaultValue="admin@omnibiz.com" type="email" />
                    <div className="pt-4 border-t border-black/5 mt-6">
                        <Button>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card title="Danger Zone" className="border-rose-100">
                <p className="text-zinc-600 text-sm mb-4">Permanent actions affecting your entire instance. Please use with extreme caution.</p>
                <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">Factory Reset Database</Button>
            </Card>
        </div>
    );
}
