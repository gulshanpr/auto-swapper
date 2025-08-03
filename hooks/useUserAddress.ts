"use client";

import { useState, useEffect } from 'react';

interface UseUserAddressReturn {
    userAddress: string | null;
    setUserAddress: (address: string | null) => void;
    clearUserAddress: () => void;
    isLoaded: boolean;
}

export function useUserAddress(): UseUserAddressReturn {
    const [userAddress, setUserAddressState] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cached address from localStorage on mount
    useEffect(() => {
        const cached = localStorage.getItem('userAddress');
        if (cached) {
            setUserAddressState(cached);
        }
        setIsLoaded(true);
    }, []);

    const setUserAddress = (address: string | null) => {
        setUserAddressState(address);
        if (address) {
            localStorage.setItem('userAddress', address);
            console.log('User address cached:', address);
        } else {
            localStorage.removeItem('userAddress');
            console.log('User address cleared from cache');
        }
    };

    const clearUserAddress = () => {
        setUserAddressState(null);
        localStorage.removeItem('userAddress');
        console.log('User address cleared');
    };

    return {
        userAddress,
        setUserAddress,
        clearUserAddress,
        isLoaded
    };
}