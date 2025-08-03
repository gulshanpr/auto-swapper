import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useUserAddress } from './useUserAddress';

export interface SwapRule {
    id: string;
    fromToken: string;
    toToken: string;
    fromChain: string;
    toChain: string;
    amount: number;
    percent?: number;
    estimatedValue?: number;
    bridgeProtocol?: string;
    frequency: string;
    nextExecution: string;
    active: boolean;
    createdAt: string;
}

export interface SwapLog {
    id: string;
    sourceTxHash?: string;
    destinationTxHash?: string;
    bridgeTxHash?: string;
    status: string;
    actualAmountIn?: number;
    actualAmountOut?: number;
    actualFees?: number;
    actualSlippage?: number;
    timestamp: string;
    details?: any;
    rule: {
        fromToken: string;
        toToken: string;
        fromChain: string;
        toChain: string;
        amount: number;
        percent?: number;
    };
}

export function useDashboardData() {
    const [swapRules, setSwapRules] = useState<SwapRule[]>([]);
    const [swapHistory, setSwapHistory] = useState<SwapLog[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const { wallets } = useWallets();
    const { userAddress, isLoaded } = useUserAddress();

    // Use cached user address if available, otherwise fall back to connected wallet
    const activeUserAddress = userAddress || wallets[0]?.address;

    const fetchSwapRules = async () => {
        if (!activeUserAddress || !isLoaded) return;

        setIsLoadingRules(true);
        try {
            console.log('Fetching swap rules for user:', activeUserAddress);
            const response = await fetch(`/api/swap-rule?user=${encodeURIComponent(activeUserAddress.toLowerCase())}`);
            if (response.ok) {
                const rules = await response.json();
                console.log('Fetched swap rules:', rules);
                setSwapRules(rules);
            } else {
                console.error('Failed to fetch swap rules');
                setSwapRules([]); // Clear rules on error
            }
        } catch (error) {
            console.error('Error fetching swap rules:', error);
            setSwapRules([]); // Clear rules on error
        } finally {
            setIsLoadingRules(false);
        }
    };

    const fetchSwapHistory = async () => {
        if (!activeUserAddress || !isLoaded) return;

        setIsLoadingHistory(true);
        try {
            console.log('Fetching swap history for user:', activeUserAddress);
            const response = await fetch(`/api/swap-status?user=${encodeURIComponent(activeUserAddress.toLowerCase())}`);
            if (response.ok) {
                const logs = await response.json();
                console.log('Fetched swap history:', logs);
                setSwapHistory(logs);
            } else {
                console.error('Failed to fetch swap history');
                setSwapHistory([]); // Clear history on error
            }
        } catch (error) {
            console.error('Error fetching swap history:', error);
            setSwapHistory([]); // Clear history on error
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const refreshData = async () => {
        await Promise.all([fetchSwapRules(), fetchSwapHistory()]);
    };

    const clearData = () => {
        setSwapRules([]);
        setSwapHistory([]);
    };

    useEffect(() => {
        fetchSwapRules();
    }, [activeUserAddress, isLoaded]);

    useEffect(() => {
        fetchSwapHistory();
    }, [activeUserAddress, isLoaded]);

    return {
        swapRules,
        swapHistory,
        isLoadingRules,
        isLoadingHistory,
        fetchSwapRules,
        fetchSwapHistory,
        refreshData,
        clearData,
        activeUserAddress,
        isUsingCachedAddress: !!userAddress,
    };
} 