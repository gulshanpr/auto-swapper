"use client";

import { useEIP7702 } from "@/hooks/useEIP7702";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function DelegateButton() {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const { delegateToContract, delegationStatus, loading } = useEIP7702();

    const handleClick = async () => {
        try {
            // Check wallet type
            const wallet = wallets[0];
            console.log('Wallet type:', wallet?.walletClientType);
            console.log('Wallet connector type:', wallet?.connectorType);

            // Ensure it's an embedded wallet
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

    // Show loading state
    if (!ready) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="px-4 py-2 bg-gray-400 text-white rounded-lg">
                    Loading...
                </div>
            </div>
        );
    }

    // Show connect wallet prompt
    if (!authenticated || wallets.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen space-y-4">
                <p className="text-gray-600">Please connect your wallet first</p>
                <a
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go to Home & Connect Wallet
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen space-y-4">
            {/* Show wallet info for debugging */}
            {wallets[0] && (
                <div className="text-sm text-gray-600 mb-4">
                    <p>Wallet Type: {wallets[0].walletClientType}</p>
                    <p>Connector: {wallets[0].connectorType}</p>
                    <p>Address: {wallets[0].address}</p>
                </div>
            )}

            <button
                onClick={handleClick}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Delegating...' : 'Delegate EOA to Contract'}
            </button>

            {/* Show delegation status */}
            {delegationStatus && (
                <div className="text-sm">
                    Status: {delegationStatus.isDelegated ? '✅ Delegated' : '❌ Not Delegated'}
                </div>
            )}
        </div>
    );
}
function revokeDelegation() {
    throw new Error("Function not implemented.");
}

