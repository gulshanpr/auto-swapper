"use client";

import { useEIP7702 } from "@/hooks/useEIP7702";
import { useEIP7702Session } from "@/hooks/useEIP7702Session";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function DelegateButton() {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const { delegateToContract, delegationStatus, loading } = useEIP7702();
    const { startSession, loading: sessionLoading, error: sessionError, isReady } = useEIP7702Session();

    const [sessionKeyAddress, setSessionKeyAddress] = useState("0xcd6be02444E6C55c80F13D0610745101aDcf0946");
    const [swapAmount, setSwapAmount] = useState("0.001");
    const [duration, setDuration] = useState(300); // 5 minutes
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleDelegate = async () => {
        try {
            const wallet = wallets[0];

            if (wallet?.connectorType !== 'embedded') {
                alert('Please use an embedded wallet (email/social login) for EIP-7702 delegation');
                return;
            }

            const txHash = await delegateToContract();
            console.log('Delegation successful:', txHash);
            alert(`Delegated successfully! Tx hash: ${txHash}`);
        } catch (err) {
            console.error('Delegation error:', err);
            alert("Delegation failed: " + (err as Error).message);
        }
    };

    const handleStartSession = async () => {
        try {
            const hash = await startSession({
                sessionKeyAddress: sessionKeyAddress as `0x${string}`,
                swapAmount,
                duration,
                gasFee: 0
            });
            setTxHash(hash);
            alert(`Session started! Tx hash: ${hash}`);
        } catch (err) {
            console.error('Session start error:', err);
            alert("Session start failed: " + (err as Error).message);
        }
    };

    if (!ready) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="px-4 py-2 bg-gray-400 text-white rounded-lg">
                    Loading...
                </div>
            </div>
        );
    }

    if (!authenticated || wallets.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen space-y-4">
                <p className="text-gray-600">Please connect your wallet first</p>
                <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Go to Home & Connect Wallet
                </a>
            </div>
        );
    }

    const isDelegated = delegationStatus?.isDelegated;

    return (
        <div className="flex flex-col justify-center items-center min-h-screen space-y-6 p-6">
            {/* Wallet Info */}
            {wallets[0] && (
                <div className="text-sm text-gray-600 mb-4 text-center">
                    <p>Wallet Type: {wallets[0].walletClientType}</p>
                    <p>Connector: {wallets[0].connectorType}</p>
                    <p>Address: {wallets[0].address}</p>
                </div>
            )}

            {/* Step 1: Delegation */}
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Step 1: Delegate Wallet</h2>
                <button
                    onClick={handleDelegate}
                    disabled={loading || isDelegated}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Delegating...' : isDelegated ? '✅ Already Delegated' : 'Delegate EOA to Contract'}
                </button>

                {delegationStatus && (
                    <div className="text-sm mt-2">
                        Status: {isDelegated ? '✅ Delegated' : '❌ Not Delegated'}
                    </div>
                )}
            </div>

            {/* Step 2: Start Session (only show if delegated) */}
            {isDelegated && (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-xl font-semibold mb-4">Step 2: Start Session</h2>

                    {/* Session Configuration */}
                    <div className="space-y-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Key Address
                            </label>
                            <input
                                type="text"
                                value={sessionKeyAddress}
                                onChange={(e) => setSessionKeyAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="0x..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Swap Amount (ETH)
                            </label>
                            <input
                                type="text"
                                value={swapAmount}
                                onChange={(e) => setSwapAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="0.001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (seconds)
                            </label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value={300}>5 minutes</option>
                                <option value={900}>15 minutes</option>
                                <option value={1800}>30 minutes</option>
                                <option value={3600}>1 hour</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleStartSession}
                        disabled={sessionLoading || !isReady}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {sessionLoading ? 'Starting Session...' : 'Start Session'}
                    </button>

                    {sessionError && (
                        <div className="text-red-500 text-sm mt-2">
                            Error: {sessionError}
                        </div>
                    )}

                    {txHash && (
                        <div className="text-green-500 text-sm mt-2">
                            Session started! Tx: {txHash.slice(0, 10)}...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

