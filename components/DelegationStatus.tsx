'use client';

import { useEffect } from 'react';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function DelegationStatus() {
    const {
        delegationStatus,
        loading,
        checkDelegationStatus,
        walletAddress
    } = useEIP7702();

    useEffect(() => {
        if (walletAddress) {
            checkDelegationStatus();
        }
    }, [walletAddress]);

    if (!walletAddress) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Delegation Status</h3>
                <p className="text-gray-400">Please connect your wallet to check delegation status</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Delegation Status</h3>
                <button
                    onClick={checkDelegationStatus}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <span className="text-gray-400">Wallet:</span>
                    <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center space-x-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking delegation status...</span>
                    </div>
                ) : delegationStatus ? (
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            {delegationStatus.isDelegated ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 font-medium">Delegated to EIP-7702 Contract</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-400" />
                                    <span className="text-red-400 font-medium">Not Delegated</span>
                                </>
                            )}
                        </div>

                        {delegationStatus.isDelegated && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Session ID:</span>
                                    <span className="ml-2 text-white">{delegationStatus.sessionId ?? 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Nonce:</span>
                                    <span className="ml-2 text-white">{delegationStatus.nonce ?? 'N/A'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-400">
                        Unable to determine delegation status
                    </div>
                )}
            </div>
        </div>
    );
}