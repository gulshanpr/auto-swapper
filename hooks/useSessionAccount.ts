"use client";

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { generateSessionKey } from '@/lib/generateSessionKey';

interface SessionAccount {
    privateKey: string;
    address: string;
    createdAt: number;
}

interface UseSessionAccountReturn {
    sessionAccount: SessionAccount | null;
    isLoaded: boolean;
    createSessionAccount: () => SessionAccount;
    clearSessionAccount: () => void;
    getSessionAccountForUser: (userAddress: string) => SessionAccount | null;
}

export function useSessionAccount(): UseSessionAccountReturn {
    const [sessionAccounts, setSessionAccounts] = useState<Record<string, SessionAccount>>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const { wallets } = useWallets();

    const currentUserAddress = wallets[0]?.address?.toLowerCase();

    // Load cached session accounts from localStorage on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem('sessionAccounts');
            if (cached) {
                const parsed = JSON.parse(cached);
                setSessionAccounts(parsed);
                console.log('Loaded cached session accounts for users:', Object.keys(parsed));
            }
        } catch (error) {
            console.error('Failed to load cached session accounts:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save session accounts to localStorage whenever they change
    const saveToCache = (accounts: Record<string, SessionAccount>) => {
        try {
            localStorage.setItem('sessionAccounts', JSON.stringify(accounts));
            console.log('Session accounts saved to cache');
        } catch (error) {
            console.error('Failed to save session accounts to cache:', error);
        }
    };

    const createSessionAccount = (): SessionAccount => {
        if (!currentUserAddress) {
            throw new Error('No wallet connected');
        }

        const { privateKey, address } = generateSessionKey();
        const sessionAccount: SessionAccount = {
            privateKey,
            address,
            createdAt: Date.now()
        };

        const updatedAccounts = {
            ...sessionAccounts,
            [currentUserAddress]: sessionAccount
        };

        setSessionAccounts(updatedAccounts);
        saveToCache(updatedAccounts);

        console.log(`Created session account for user ${currentUserAddress}:`, address);
        return sessionAccount;
    };

    const clearSessionAccount = () => {
        if (!currentUserAddress) return;

        const updatedAccounts = { ...sessionAccounts };
        delete updatedAccounts[currentUserAddress];

        setSessionAccounts(updatedAccounts);
        saveToCache(updatedAccounts);

        console.log(`Cleared session account for user ${currentUserAddress}`);
    };

    const getSessionAccountForUser = (userAddress: string): SessionAccount | null => {
        return sessionAccounts[userAddress.toLowerCase()] || null;
    };

    // Auto-create session account for new users
    useEffect(() => {
        if (!isLoaded || !currentUserAddress) return;

        const existingAccount = sessionAccounts[currentUserAddress];
        if (!existingAccount) {
            console.log(`No session account found for ${currentUserAddress}, creating new one...`);
            createSessionAccount();
        } else {
            console.log(`Using existing session account for ${currentUserAddress}:`, existingAccount.address);
        }
    }, [currentUserAddress, isLoaded]);

    const currentSessionAccount = currentUserAddress ? sessionAccounts[currentUserAddress] || null : null;

    return {
        sessionAccount: currentSessionAccount,
        isLoaded,
        createSessionAccount,
        clearSessionAccount,
        getSessionAccountForUser,
    };
}