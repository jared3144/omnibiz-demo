import React, { createContext, useContext, useState, useEffect } from 'react';
import { Business } from '../types';

interface BusinessContextType {
    businesses: Business[];
    selectedBusiness: Business | null;
    setSelectedBusiness: (business: Business | null) => void;
    isLoading: boolean;
    refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshBusinesses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/businesses');
            const data = await res.json();
            setBusinesses(data);
            if (data.length > 0 && !selectedBusiness) {
                setSelectedBusiness(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch businesses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBusinesses();
    }, []);

    return (
        <BusinessContext.Provider value={{ businesses, selectedBusiness, setSelectedBusiness, isLoading, refreshBusinesses }}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
}
