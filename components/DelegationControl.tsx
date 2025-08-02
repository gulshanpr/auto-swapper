'use client';

import { useState } from 'react';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { Shield, ShieldOff, Loader2, ExternalLink } from 'lucide-react';

export default function DelegationControl() {
    const {
        delegationStatus,
        loading,
        delegateToContract,
        revokeDelegation,
        walletAddress
    } = useEIP7702();

    const [txHash, setTxHash] = useState<string | null>(null);

    const handleDelegate = async () => {
        try {
            setTxHash(null);
            const hash = await delegateToContract();
            setTxHash(hash);
        } catch (error) {
            console.error('Failed to delegate:', error);
            alert('Failed to delegate. Check console for details.');
        }
    };

    const handleRevoke = async () => {
        try {
            setTxHash(null);
            const hash = await revokeDelegation();
            setTxHash(hash);
        } catch (error) {
            console.error('Failed to revoke:', error);
            alert('Failed to revoke delegation. Check console for details.');
        }
    };

    if (!walletAddress) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Delegation Control</h3>
                <p className="text-gray-400">Please connect your wallet to manage delegation</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Delegation Control</h3>

            <div className="space-y-4">
                <div className="text-sm text-gray-300">
                    <p className="mb-2">
                        <strong>EIP-7702 Account Delegation</strong> allows your EOA to execute smart contract functions directly.
                    </p>
                    <p>
                        When delegated, your wallet gains the capabilities of the EIP-7702 Session Delegator contract.
                    </p>
                </div>

                <div className="flex space-x-4">
                    {!delegationStatus?.isDelegated ? (
                        <button
                            onClick={handleDelegate}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Shield className="w-4 h-4" />
                            )}
                            <span>{loading ? 'Delegating...' : 'Delegate to Contract'}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleRevoke}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShieldOff className="w-4 h-4" />
                            )}
                            <span>{loading ? 'Revoking...' : 'Revoke Delegation'}</span>
                        </button>
                    )}
                </div>

                {txHash && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-green-400">
                            <span className="text-sm font-medium">Transaction successful!</span>
                            <a
                                href={`https://sepolia.basescan.org/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                            >
                                <ExternalLink className="w-3 h-3" />
                                <span className="text-xs">View on Explorer</span>
                            </a>
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-1">
                            {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}