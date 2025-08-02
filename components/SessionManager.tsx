'use client';

import { useState } from 'react';
import { useEIP7702 } from '@/hooks/useEIP7702';
import { ZERO_ADDRESS } from '@/utils/constants';
import { Plus, Loader2, ExternalLink } from 'lucide-react';

export default function SessionManager() {
    const { delegationStatus, loading, startSession, walletAddress } = useEIP7702();
    const [showForm, setShowForm] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        sessionKey: '',
        swapToken: ZERO_ADDRESS as string,
        swapAmount: '0.001',
        duration: '300',
        gasFee: '0'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setTxHash(null);
            const hash = await startSession({
                sessionKey: formData.sessionKey,
                swapToken: formData.swapToken,
                swapAmount: formData.swapAmount,
                duration: parseInt(formData.duration),
                gasFee: formData.gasFee
            });
            setTxHash(hash);
            setShowForm(false);
            // Reset form
            setFormData({
                sessionKey: '',
                swapToken: ZERO_ADDRESS as string,
                swapAmount: '0.001',
                duration: '300',
                gasFee: '0'
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            alert('Failed to start session. Check console for details.');
        }
    };

    if (!walletAddress) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Session Manager</h3>
                <p className="text-gray-400">Please connect your wallet to manage sessions</p>
            </div>
        );
    }

    if (!delegationStatus?.isDelegated) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Session Manager</h3>
                <p className="text-gray-400">Please delegate your account first to manage sessions</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Session Manager</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Session</span>
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-700 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Session Key Address
                        </label>
                        <input
                            type="text"
                            value={formData.sessionKey}
                            onChange={(e) => setFormData({ ...formData, sessionKey: e.target.value })}
                            placeholder="0x..."
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Swap Token
                        </label>
                        <select
                            value={formData.swapToken}
                            onChange={(e) => setFormData({ ...formData, swapToken: e.target.value })}
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        >
                            <option value={ZERO_ADDRESS}>ETH (Native)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Or enter custom token address (0x...)"
                            onChange={(e) => {
                                if (e.target.value) {
                                    setFormData({ ...formData, swapToken: e.target.value });
                                }
                            }}
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none mt-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Swap Amount (ETH)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                value={formData.swapAmount}
                                onChange={(e) => setFormData({ ...formData, swapAmount: e.target.value })}
                                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Duration (seconds)
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Gas Fee (ETH)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            value={formData.gasFee}
                            onChange={(e) => setFormData({ ...formData, gasFee: e.target.value })}
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            <span>{loading ? 'Creating...' : 'Start Session'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {txHash && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-400">
                        <span className="text-sm font-medium">Session created successfully!</span>
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
    );
}