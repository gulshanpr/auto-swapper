"use client";
import { useState, useEffect } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { useWallets } from "@privy-io/react-auth";
import AutoRebalancingModal from "@/components/modals/AutoRebalancingModal";
import BalanceSection from "@/components/dashboard/BalanceSection";
import ActiveRulesSection from "@/components/dashboard/ActiveRulesSection";
import ScheduledSwapsSection from "@/components/dashboard/ScheduledSwapsSection";
import SwapHistorySection from "@/components/dashboard/SwapHistorySection";
import { checkDelegationStatus, fetchTokenBalances, type DelegationStatus, type TokenBalances } from "@/lib/utils";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUserAddress } from "@/hooks/useUserAddress";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delegationStatus, setDelegationStatus] = useState<DelegationStatus | null>(null);
  const [isCheckingDelegation, setIsCheckingDelegation] = useState(false);
  const [balances, setBalances] = useState<TokenBalances>({ ETH: 0, USDC: 0 });
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);

  const { wallets } = useWallets();
  const { userAddress, clearUserAddress } = useUserAddress();
  const {
    swapRules,
    swapHistory,
    isLoadingRules,
    isLoadingHistory,
    refreshData,
    activeUserAddress,
    isUsingCachedAddress,
  } = useDashboardData();

  // Fetch balances when user address changes
  useEffect(() => {
    const fetchBalances = async () => {
      const addressToUse = activeUserAddress || wallets[0]?.address;
      if (!addressToUse) return;

      setIsLoadingBalances(true);
      try {
        console.log('Fetching balances for:', addressToUse);
        const tokenBalances = await fetchTokenBalances(addressToUse);
        setBalances(tokenBalances);
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchBalances();
  }, [activeUserAddress, wallets]);

  const handleCheckDelegation = async () => {
    const addressToCheck = activeUserAddress || wallets[0]?.address;
    if (!addressToCheck) {
      console.error('No address available for delegation check');
      return;
    }

    setIsCheckingDelegation(true);
    try {
      console.log('Checking delegation for:', addressToCheck);
      const status = await checkDelegationStatus(addressToCheck);
      setDelegationStatus(status);
    } catch (error) {
      console.error('Failed to check delegation:', error);
      setDelegationStatus({ isDelegated: false, error });
    } finally {
      setIsCheckingDelegation(false);
    }
  };

  const handleRefreshBalances = async () => {
    const addressToUse = activeUserAddress || wallets[0]?.address;
    if (!addressToUse) return;

    setIsLoadingBalances(true);
    try {
      const tokenBalances = await fetchTokenBalances(addressToUse);
      setBalances(tokenBalances);
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const handleRefreshData = async () => {
    await Promise.all([
      handleRefreshBalances(),
      refreshData(),
    ]);
  };

  const handleDelegationChange = () => {
    // Refresh delegation status after delegation operations
    handleCheckDelegation();
  };

  return (
    <div className="min-h-screen p-6 pt-30 grid place-items-center">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70">
              Manage your automated swapping rules and monitor your portfolio
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCheckDelegation}
              disabled={isCheckingDelegation}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${delegationStatus?.isDelegated
                ? "bg-green-500 text-white hover:bg-green-600"
                : delegationStatus !== null && !delegationStatus.isDelegated
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}>
              {isCheckingDelegation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking...
                </>
              ) : delegationStatus?.isDelegated ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Delegated
                </>
              ) : delegationStatus !== null && !delegationStatus.isDelegated ? (
                <>
                  <Shield className="w-4 h-4" />
                  Not Delegated
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Check Delegation
                </>
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Edit
            </button>
            <AutoRebalancingModal
              open={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                handleRefreshData();
              }}
              delegationStatus={delegationStatus}
              onSuccess={handleRefreshData}
            />
          </div>
        </div>

        {/* User Info Section */}
        <div className="mb-8">
          <div className={`border rounded-lg p-4 ${isUsingCachedAddress
            ? "bg-green-500/20 border-green-500/30"
            : "bg-blue-500/20 border-blue-500/30"
            }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  {isUsingCachedAddress ? "Connected Wallet User" : "Automated Swapping"}
                </h3>
              </div>
              {isUsingCachedAddress && (
                <button
                  onClick={clearUserAddress}
                  className="px-3 py-1 text-xs bg-red-500/20 border border-red-500/30 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                >
                  Clear User
                </button>
              )}
            </div>
            {isUsingCachedAddress ? (
              <div className="space-y-1">
                <p className="text-green-300 text-sm">
                  ✅ Showing data for: <span className="font-mono text-xs">{activeUserAddress}</span>
                </p>
                <p className="text-green-300/80 text-xs">
                  Data is loaded from your connected wallet. Click "Edit" to manage swap rules with auto-generated session accounts.
                </p>
              </div>
            ) : (
              <p className="text-blue-300 text-sm">
                Connect your wallet and click "Edit" to configure automated swap rules. Session accounts will be auto-generated securely for delegation.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
            <BalanceSection
              balances={balances}
              isLoadingBalances={isLoadingBalances}
              onRefreshBalances={handleRefreshBalances}
            />

            <div className="h-0.5 w-full bg-white/10 rounded-full"></div>

            <ActiveRulesSection
              swapRules={swapRules}
              isLoadingRules={isLoadingRules}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ScheduledSwapsSection
              swapRules={swapRules}
              isLoadingRules={isLoadingRules}
            />

            <SwapHistorySection
              swapHistory={swapHistory}
              isLoadingHistory={isLoadingHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
