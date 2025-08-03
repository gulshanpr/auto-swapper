"use client";

import { useState } from "react";
import { Shield, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import {
    revokeDelegation,
    getAddressFromPrivateKey,
    isValidPrivateKey,
    type DelegationResult
} from "@/lib/utils";
import { delegateEOA } from "@/lib/utils";

interface DelegationManagementProps {
    onDelegationChange?: () => void;
    className?: string;
}

export default function DelegationManagement({
    onDelegationChange,
    className = ""
}: DelegationManagementProps) {
    const [privateKey, setPrivateKey] = useState("");
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DelegationResult | null>(null);
    const [accountAddress, setAccountAddress] = useState<string | null>(null);

    const handlePrivateKeyChange = (value: string) => {
        setPrivateKey(value);
        setResult(null);

        if (isValidPrivateKey(value)) {
            const address = getAddressFromPrivateKey(value);
            setAccountAddress(address);
        } else {
            setAccountAddress(null);
        }
    };

    const handleDelegate = async () => {
        if (!isValidPrivateKey(privateKey)) {
            setResult({ success: false, error: "Invalid private key format" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const result = await delegateEOA(privateKey);
            setResult(result);

            if (result.success && onDelegationChange) {
                onDelegationChange();
            }
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!isValidPrivateKey(privateKey)) {
            setResult({ success: false, error: "Invalid private key format" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const result = await revokeDelegation(privateKey);
            setResult(result);

            if (result.success && onDelegationChange) {
                onDelegationChange();
            }
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 ${className}`}>
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">EIP-7702 Delegation Management</h3>
            </div>

            <div className="space-y-4">
                {/* Private Key Input */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Private Key
                    </label>
                    <div className="relative">
                        <input
                            type={showPrivateKey ? "text" : "password"}
                            value={privateKey}
                            onChange={(e) => handlePrivateKeyChange(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                        >
                            {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {accountAddress && (
                        <p className="text-xs text-green-400 mt-1">
                            Account: {accountAddress}
                        </p>
                    )}

                    {privateKey && !isValidPrivateKey(privateKey) && (
                        <p className="text-xs text-red-400 mt-1">
                            Invalid private key format
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDelegate}
                        disabled={!isValidPrivateKey(privateKey) || isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-4 h-4" />
                        )}
                        Delegate EOA
                    </button>

                    <button
                        onClick={handleRevoke}
                        disabled={!isValidPrivateKey(privateKey) || isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Shield className="w-4 h-4" />
                        )}
                        Revoke Delegation
                    </button>
                </div>

                {/* Result Display */}
                {result && (
                    <div className={`p-4 rounded-md ${result.success
                        ? "bg-green-500/20 border border-green-500/30"
                        : "bg-red-500/20 border border-red-500/30"
                        }`}>
                        <p className={`text-sm font-medium ${result.success ? "text-green-400" : "text-red-400"
                            }`}>
                            {result.success ? "✅ Success!" : "❌ Error"}
                        </p>
                        {result.transactionHash && (
                            <p className="text-xs text-white/70 mt-1">
                                Tx: {result.transactionHash}
                            </p>
                        )}
                        {result.error && (
                            <p className="text-xs text-red-300 mt-1">
                                {result.error}
                            </p>
                        )}
                    </div>
                )}

                {/* Info Text */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-md p-3">
                    <p className="text-xs text-blue-300">
                        ℹ️ <strong>Info:</strong> Once delegated, you can create automated swap rules using the "Edit" button. Each swap rule will automatically generate its own unique session key.
                    </p>
                </div>

                {/* Security Warning */}
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-md p-3">
                    <p className="text-xs text-yellow-300">
                        ⚠️ <strong>Security Warning:</strong> Never share your private key. This interface is for testing purposes only.
                    </p>
                </div>
            </div>
        </div>
    );
}