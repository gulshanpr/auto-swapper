import { Clock, DollarSign, Edit, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import EditRuleModal from "./EditRuleModal";
import Image from "next/image";

interface AutoRebalancingModalProps {
  onClose?: () => void;
}

const AutoRebalancingModal = ({ onClose }: AutoRebalancingModalProps) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [balances, setBalances] = useState({ usdc: 2250.0, eth: 0.2 });
  type Swap = { id: number; text: string };
  const [recentSwaps, setRecentSwaps] = useState<Swap[]>([]);
  const [scheduledRule, setScheduledRule] = useState("Every Monday - Convert 25% of USDC to ETH");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setIsAuthorized(true);

      const swapAmount = balances.usdc * 0.25;
      const ethReceived = swapAmount / 3500;

      setBalances({
        usdc: balances.usdc - swapAmount,
        eth: balances.eth + ethReceived,
      });

      setRecentSwaps((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Swapped ${swapAmount.toFixed(2)} USDC for ${ethReceived.toFixed(4)} ETH`,
        },
      ]);
    }, 2000);
  };

  const handleSaveRule = (newRule: string) => {
    setScheduledRule(newRule);
  };

  return (
    <>
      <EditRuleModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRule}
        currentRule={scheduledRule}
      />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[9999] h-screen">
        <div className="bg-[#1e1e2f] rounded-2xl border border-white/20 shadow-2xl max-w-lg w-full m-auto z-[9999] overflow-hidden p-4">
          <div className="p-4 overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Auto-Rebalancing Dashboard</h2>
              <button
                className="text-white/60 hover:text-white transition-colors text-2xl font-light cursor-pointer"
                onClick={onClose}>
                <X />
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <Image src="/usd-coin-usdc-logo.svg" alt="USDC Logo" width={24} height={24} />
                    </div>
                    <span className="text-xl font-bold text-white">2,500.00 USDC</span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-md flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300 text-sm sm:text-base">
                      Convert 10% to ETH weekly
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-300 mb-3">Balances</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/20 p-2 rounded-full">
                        <Image
                          src="/usd-coin-usdc-logo.svg"
                          alt="USDC Logo"
                          width={24}
                          height={24}
                        />
                      </div>
                      <span className="font-medium text-white">
                        {balances.usdc.toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-700/50 size-10 rounded-full grid place-items-center">
                        <Image src="/ethereum-eth-logo.svg" alt="ETH Logo" width={20} height={20} />
                      </div>
                      <span className="font-medium text-white">{balances.eth.toFixed(4)} ETH</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-300 mb-3">Scheduled swaps</h3>
                  <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-slate-300 text-sm flex-1">{scheduledRule}</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center space-x-1 ml-2">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
                {recentSwaps.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-300 mb-3">Recent Swaps</h3>
                    <div className="space-y-2 text-sm text-slate-400">
                      {recentSwaps.map((swap) => (
                        <p key={swap.id} className="p-2 bg-slate-800/50 rounded-md">
                          ✓ {swap.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleAuthorize}
                  disabled={isAuthorizing || isAuthorized}
                  className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 flex justify-center items-center disabled:bg-slate-600 disabled:cursor-not-allowed">
                  {isAuthorizing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> Authorizing...
                    </>
                  ) : isAuthorized ? (
                    "Rule is Active"
                  ) : (
                    "Authorize"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoRebalancingModal;
