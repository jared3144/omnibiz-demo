import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { BusinessProvider } from './context/BusinessContext';

// Pages
import Dashboard from './pages/Dashboard';
import Businesses from './pages/Businesses';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Staff from './pages/Staff';
import CRM from './pages/CRM';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BusinessProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="staff" element={<Staff />} />
          <Route path="crm" element={<CRM />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BusinessProvider>
  );
}
