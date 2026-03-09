import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount);
}

export interface InventoryItem {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

export interface Business {
  id: string;
  name: string;
  type: 'restaurant' | 'butchery' | 'retail' | 'service' | 'hospitality';
  location: string;
}

export interface DashboardMetrics {
  businesses: number;
  revenue: number;
  lowStock: number;
  activeStaff: number;
}

export interface StaffMember {
  id: string;
  business_id: string;
  name: string;
  role: string;
  salary: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyalty_points: number;
}

export interface Expense {
  id: string;
  business_id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Sale {
  id: string;
  business_id: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
}
