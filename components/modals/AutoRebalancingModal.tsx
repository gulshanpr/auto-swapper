import { Check, Edit, Loader2, X } from "lucide-react";
import { useState } from "react";
import EditRuleModal from "./EditRuleModal";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AutoRebalancingModalProps {
  open: boolean;
  onClose: () => void;
}

const AutoRebalancingModal = ({ open, onClose }: AutoRebalancingModalProps) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [availableBalances, setAvailableBalances] = useState({ usdc: 2250.0, eth: 0.2 });

  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrequency, setSwapFrequency] = useState("Weekly");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("ETH");

  const [recentSwaps, setRecentSwaps] = useState<{ id: number; text: string }[]>([]);
  const [scheduledRule, setScheduledRule] = useState("Every Monday - Convert 25% of USDC to ETH");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setIsAuthorized(true);

      const swapAmountValue = availableBalances.usdc * 0.25;
      const ethReceived = swapAmountValue / 3500;

      setAvailableBalances({
        usdc: availableBalances.usdc - swapAmountValue,
        eth: availableBalances.eth + ethReceived,
      });

      setRecentSwaps((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Swapped ${swapAmountValue.toFixed(2)} USDC for ${ethReceived.toFixed(4)} ETH`,
        },
      ]);
    }, 2000);
  };

  const handleSaveRule = (newRule: string) => {
    setScheduledRule(newRule);
  };

  const tokens = [
    { value: "USDC", label: "USDC", logo: "/usd-coin-usdc-logo.svg" },
    { value: "ETH", label: "ETH", logo: "/ethereum-eth-logo.svg" },
  ];

  return (
    <>
      <EditRuleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRule}
        currentRule={scheduledRule}
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#232323] border-white/20 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Auto-Rebalancing Dashboard
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="space-y-6">
              <div className="bg-[#232323] p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-4">Available Balance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/20 p-2 rounded-full">
                        <Image
                          src="/usd-coin-usdc-logo.svg"
                          alt="USDC Logo"
                          width={20}
                          height={20}
                        />
                      </div>
                      <span className="font-medium text-white">USDC</span>
                    </div>
                    <span className="text-xl font-bold text-white">
                      {availableBalances.usdc.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#232323] p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-4">Configure Auto-Swap</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-token" className="text-sm font-medium text-slate-300">
                      From Token
                    </Label>
                    <Select value={fromToken} onValueChange={setFromToken}>
                      <SelectTrigger className="w-full bg-[#1e1d1d] border-white/20 text-white">
                        <div className="flex items-center space-x-2">
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1d1d] border-white/20">
                        {tokens.map((token) => (
                          <SelectItem key={token.value} value={token.value} className="text-white">
                            <div className="flex items-center space-x-2">
                              <Image
                                src={token.logo}
                                alt={`${token.label} Logo`}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                              <span>{token.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-token" className="text-sm font-medium text-slate-300">
                      To Token
                    </Label>
                    <Select value={toToken} onValueChange={setToToken}>
                      <SelectTrigger className="w-full bg-[#1e1d1d] border-white/20 text-white">
                        <div className="flex items-center space-x-2">
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1d1d] border-white/20">
                        {tokens.map((token) => (
                          <SelectItem key={token.value} value={token.value} className="text-white">
                            <div className="flex items-center space-x-2">
                              <Image
                                src={token.logo}
                                alt={`${token.label} Logo`}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                              <span>{token.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swap-amount" className="text-sm font-medium text-slate-300">
                      Amount to Swap (%)
                    </Label>
                    <Input
                      id="swap-amount"
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      placeholder="e.g., 25"
                      min="1"
                      max="100"
                      className="bg-[#1e1d1d] border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-sm font-medium text-slate-300">
                      Frequency
                    </Label>
                    <Select value={swapFrequency} onValueChange={setSwapFrequency}>
                      <SelectTrigger className="w-full bg-[#1e1d1d] border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1d1d] border-white/20">
                        <SelectItem value="Daily" className="text-white">
                          Daily
                        </SelectItem>
                        <SelectItem value="Weekly" className="text-white">
                          Weekly
                        </SelectItem>
                        <SelectItem value="Monthly" className="text-white">
                          Monthly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-300 mb-3">Scheduled swaps</h3>
                <div className="flex justify-between items-center bg-[#232323] p-3 rounded-lg">
                  <p className="text-slate-300 text-sm flex-1">{scheduledRule}</p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              {recentSwaps.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-300 mb-3">Recent Swaps</h3>
                  <div className="space-y-2 text-sm text-offwhite">
                    {recentSwaps.map((swap) => (
                      <p key={swap.id} className="p-2 bg-[#232323] rounded-md">
                        <Check className="inline-block mr-1" />
                        {swap.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <Button
                onClick={handleAuthorize}
                disabled={isAuthorizing || isAuthorized}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 transition-all duration-300 disabled:bg-slate-600"
                size="lg">
                {isAuthorizing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Authorizing...
                  </>
                ) : isAuthorized ? (
                  "Rule is Active"
                ) : (
                  "Authorize"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AutoRebalancingModal;
