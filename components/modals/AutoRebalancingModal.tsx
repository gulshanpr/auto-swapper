import { Check, Edit, Loader2, X, AlertCircle, Calendar, Eye, EyeOff, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
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
import {
  type DelegationStatus,
  fetchTokenBalances,
  type TokenBalances,
  type SessionParams
} from "@/lib/utils";
import { useEIP7702 } from "@/hooks/useEIP7702";
import { generateSessionKey } from "@/lib/generateSessionKey";
import { useUserAddress } from "@/hooks/useUserAddress";
import { useSessionAccount } from "@/hooks/useSessionAccount";

interface AutoRebalancingModalProps {
  open: boolean;
  onClose: () => void;
  delegationStatus: DelegationStatus | null;
  onSuccess?: () => void; // Callback to refresh dashboard data
}

const AutoRebalancingModal = ({ open, onClose, delegationStatus, onSuccess }: AutoRebalancingModalProps) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [balances, setBalances] = useState<TokenBalances>({ ETH: 0, USDC: 0 });
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);

  // Private key management
  // Remove private key state - now using connected wallet and auto-generated session account

  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrequency, setSwapFrequency] = useState("Daily");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("ETH");
  const [destinationChain, setDestinationChain] = useState("Base Sepolia");

  // Frequency specific fields
  const [weekDay, setWeekDay] = useState("Monday");
  const [monthDate, setMonthDate] = useState("1");

  const [recentSwaps, setRecentSwaps] = useState<{ id: number; text: string }[]>([]);
  const [scheduledRule, setScheduledRule] = useState("Every Monday - Convert 25% of USDC to ETH");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { wallets } = useWallets();
  const { setUserAddress } = useUserAddress();
  const { sessionAccount, isLoaded: isSessionLoaded } = useSessionAccount();
  const { startSession, delegationStatus: currentDelegationStatus, loading: isDelegating } = useEIP7702();

  // Fetch balances when modal opens
  useEffect(() => {
    const fetchModalBalances = async () => {
      if (!open || !wallets[0]?.address) return;

      setIsLoadingBalances(true);
      try {
        const tokenBalances = await fetchTokenBalances(wallets[0].address);
        setBalances(tokenBalances);
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchModalBalances();
  }, [open, wallets]);

  // Cache the connected wallet address for fetching historical data
  useEffect(() => {
    if (wallets[0]?.address) {
      setUserAddress(wallets[0].address);
    }
  }, [wallets, setUserAddress]);

  // Calculate duration based on frequency
  const calculateDuration = (): number => {
    switch (swapFrequency) {
      case "Daily":
        return 24 * 60 * 60; // 24 hours in seconds
      case "Weekly":
        return 7 * 24 * 60 * 60; // 7 days in seconds
      case "Monthly":
        return 30 * 24 * 60 * 60; // 30 days in seconds
      default:
        return 24 * 60 * 60;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Wallet connection validation
    if (!wallets[0]?.address) {
      newErrors.wallet = "Please connect your wallet";
    }

    // Session account validation
    if (!sessionAccount || !isSessionLoaded) {
      newErrors.session = "Session account not ready";
    }

    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      newErrors.swapAmount = "Amount must be greater than 0";
    } else {
      const amount = parseFloat(swapAmount);
      const fromBalance = balances[fromToken as keyof TokenBalances];

      if (amount > fromBalance) {
        newErrors.swapAmount = `Amount cannot exceed available balance (${fromBalance.toFixed(4)} ${fromToken})`;
      }
    }

    if (!fromToken) newErrors.fromToken = "Please select a from token";
    if (!toToken) newErrors.toToken = "Please select a to token";
    // if (fromToken === toToken) newErrors.toToken = "From and To tokens must be different";
    if (!destinationChain) newErrors.destinationChain = "Please select destination chain";

    if (swapFrequency === "Weekly" && !weekDay) {
      newErrors.weekDay = "Please select a day for weekly swaps";
    }

    if (swapFrequency === "Monthly" && (!monthDate || parseInt(monthDate) < 1 || parseInt(monthDate) > 31)) {
      newErrors.monthDate = "Please select a valid date (1-31) for monthly swaps";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createSessionAndRule = async () => {
    try {
      // Use the connected wallet address
      const walletAddress = wallets[0]?.address;
      if (!walletAddress) throw new Error('No wallet connected');

      // Use the auto-generated session account
      if (!sessionAccount) throw new Error('Session account not available');

      console.log('Using session account:', sessionAccount.address);
      console.log('Connected wallet:', walletAddress);

      // Calculate gas fee (0.001 ETH for gas)
      const gasFee = "0.001";

      // Call the REAL EIP-7702 function from useEIP7702 hook
      const transactionHash = await startSession({
        sessionKey: sessionAccount.address,
        swapToken: fromToken === 'ETH' ? '0x0000000000000000000000000000000000000000' : fromToken,
        swapAmount,
        duration: calculateDuration(),
        gasFee
      });

      console.log('REAL delegation successful! Transaction hash:', transactionHash);

      // Calculate next execution date
      const nextExecution = calculateNextExecution();

      // Create session key in database (save both private and public session keys)
      const sessionPayload = {
        user: walletAddress.toLowerCase(),
        delegator: walletAddress,
        sessionKeyPrivate: sessionAccount.privateKey,
        sessionKeyPublic: sessionAccount.address,
        validUntil: Math.floor(Date.now() / 1000) + calculateDuration(),
        actions: ['SWAP'],
      };

      console.log('Creating session key in database with payload:', sessionPayload);

      const sessionResponse = await fetch('/api/session-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.text();
        console.error('Session creation failed:', errorData);
        throw new Error(`Failed to create session key: ${errorData}`);
      }

      const { id: sessionKeyId } = await sessionResponse.json();
      console.log('Session key created with ID:', sessionKeyId);

      // Create swap rule
      const rulePayload = {
        user: walletAddress.toLowerCase(),
        sessionKeyId,
        fromToken,
        toToken,
        fromChain: "Base Sepolia",
        toChain: destinationChain,
        percent: null,
        amount: parseFloat(swapAmount),
        frequency: getFrequencyString(),
        nextExecution: nextExecution.toISOString(),
      };

      console.log('Creating swap rule with payload:', rulePayload);

      const ruleResponse = await fetch('/api/swap-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rulePayload),
      });

      if (!ruleResponse.ok) {
        const errorData = await ruleResponse.text();
        console.error('Rule creation failed:', errorData);
        throw new Error(`Failed to create swap rule: ${errorData}`);
      }

      const ruleResult = await ruleResponse.json();
      console.log('Swap rule created:', ruleResult);

      return true;
    } catch (error) {
      console.error('Error creating session and rule:', error);
      throw error;
    }
  };

  const calculateNextExecution = (): Date => {
    const now = new Date();
    let nextExecution = new Date(now);

    switch (swapFrequency) {
      case "Daily":
        nextExecution.setDate(now.getDate() + 1);
        break;
      case "Weekly":
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetDay = dayNames.indexOf(weekDay);
        const currentDay = now.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
        nextExecution.setDate(now.getDate() + daysUntilTarget);
        break;
      case "Monthly":
        const targetDate = parseInt(monthDate);
        nextExecution.setDate(targetDate);
        if (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + 1);
        }
        break;
    }

    return nextExecution;
  };

  const getFrequencyString = (): string => {
    switch (swapFrequency) {
      case "Daily":
        return "daily";
      case "Weekly":
        return `weekly_${weekDay.toLowerCase()}`;
      case "Monthly":
        return `monthly_${monthDate}`;
      default:
        return "daily";
    }
  };

  const handleAuthorize = async () => {
    if (!validateForm()) {
      return;
    }

    setIsAuthorizing(true);
    try {
      await createSessionAndRule();
      setIsAuthorized(true);

      // Call success callback to refresh dashboard data
      if (onSuccess) {
        onSuccess();
      }

      // Update UI state
      setRecentSwaps((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `✅ REAL Transaction! Delegated EOA and created session for ${swapAmount} ${fromToken} → ${toToken}`,
        },
      ]);
    } catch (error) {
      console.error('Failed to authorize:', error);
      setErrors({ general: `Failed to create swap rule: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSaveRule = (newRule: string) => {
    setScheduledRule(newRule);
  };

  const tokens = [
    { value: "USDC", label: "USDC", logo: "/usd-coin-usdc-logo.svg" },
    { value: "ETH", label: "ETH", logo: "/ethereum-eth-logo.svg" },
  ];

  const chains = [
    { value: "Base Sepolia", label: "Base Sepolia" },
    { value: "Ethereum Sepolia", label: "Ethereum Sepolia" },
    { value: "Arbitrum Sepolia", label: "Arbitrum Sepolia" },
  ];

  const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
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


            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Error</span>
                </div>
                <p className="text-red-200 text-sm mt-1">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Available Balances */}
              <div className="bg-[#232323] p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-4">Available Balance</h3>
                <div className="space-y-3">
                  {Object.entries(balances).map(([token, amount]) => (
                    <div key={token} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                          <Image
                            src={token === "ETH" ? "/ethereum-eth-logo.svg" : "/usd-coin-usdc-logo.svg"}
                            alt={`${token} Logo`}
                            width={20}
                            height={20}
                          />
                        </div>
                        <span className="font-medium text-white">{token}</span>
                      </div>
                      <div className="text-right">
                        {isLoadingBalances ? (
                          <div className="w-16 h-6 bg-white/20 rounded animate-pulse"></div>
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {amount.toLocaleString(undefined, {
                              minimumFractionDigits: token === 'ETH' ? 4 : 2,
                              maximumFractionDigits: token === 'ETH' ? 4 : 2
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Account Status */}
              <div className="bg-[#232323] p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Session Account
                </h3>
                <div className="space-y-4">
                  {!isSessionLoaded ? (
                    <p className="text-yellow-300 text-sm">Loading session account...</p>
                  ) : sessionAccount ? (
                    <div className="space-y-2">
                      <p className="text-green-400 text-sm">
                        ✅ Session account ready
                      </p>
                      <p className="text-xs text-white/70 font-mono break-all">
                        {sessionAccount.address}
                      </p>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-md p-2">
                        <p className="text-xs text-blue-300">
                          🔐 Auto-generated secure session account for this wallet
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-red-400 text-sm">Session account not available</p>
                      <p className="text-xs text-white/50">Please connect your wallet</p>
                    </div>
                  )}

                  {wallets[0]?.address && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">Connected Wallet:</p>
                      <p className="text-xs text-white/70 font-mono break-all">
                        {wallets[0].address}
                      </p>
                      <div className="bg-green-500/20 border border-green-500/30 rounded-md p-2">
                        <p className="text-xs text-green-300">
                          🔗 This wallet will delegate to the contract and fund the session account
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.wallet && <p className="text-red-400 text-xs">{errors.wallet}</p>}
                  {errors.session && <p className="text-red-400 text-xs">{errors.session}</p>}
                </div>
              </div>

              {/* Configure Auto-Swap */}
              <div className="bg-[#232323] p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-4">Configure Auto-Swap</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-token" className="text-sm font-medium text-slate-300">
                      From Token
                    </Label>
                    <Select value={fromToken} onValueChange={setFromToken}>
                      <SelectTrigger className={`w-full bg-[#1e1d1d] border-white/20 text-white ${errors.fromToken ? 'border-red-500' : ''}`}>
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
                    {errors.fromToken && <p className="text-red-400 text-xs">{errors.fromToken}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-token" className="text-sm font-medium text-slate-300">
                      To Token
                    </Label>
                    <Select value={toToken} onValueChange={setToToken}>
                      <SelectTrigger className={`w-full bg-[#1e1d1d] border-white/20 text-white ${errors.toToken ? 'border-red-500' : ''}`}>
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
                    {errors.toToken && <p className="text-red-400 text-xs">{errors.toToken}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination-chain" className="text-sm font-medium text-slate-300">
                      Destination Chain
                    </Label>
                    <Select value={destinationChain} onValueChange={setDestinationChain}>
                      <SelectTrigger className={`w-full bg-[#1e1d1d] border-white/20 text-white ${errors.destinationChain ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1d1d] border-white/20">
                        {chains.map((chain) => (
                          <SelectItem key={chain.value} value={chain.value} className="text-white">
                            {chain.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.destinationChain && <p className="text-red-400 text-xs">{errors.destinationChain}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swap-amount" className="text-sm font-medium text-slate-300">
                      Amount to Swap ({fromToken})
                    </Label>
                    <Input
                      id="swap-amount"
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      placeholder={`e.g., ${(balances[fromToken as keyof TokenBalances] * 0.25).toFixed(2)}`}
                      min="0"
                      max={balances[fromToken as keyof TokenBalances]}
                      step="0.01"
                      className={`bg-[#1e1d1d] border-white/20 text-white placeholder:text-white/50 ${errors.swapAmount ? 'border-red-500' : ''}`}
                    />
                    {errors.swapAmount && <p className="text-red-400 text-xs">{errors.swapAmount}</p>}
                    <p className="text-xs text-white/50">
                      Available: {balances[fromToken as keyof TokenBalances].toFixed(4)} {fromToken}
                    </p>
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
                        <SelectItem value="Daily" className="text-white">Daily</SelectItem>
                        <SelectItem value="Weekly" className="text-white">Weekly</SelectItem>
                        <SelectItem value="Monthly" className="text-white">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Frequency specific fields */}
                  {swapFrequency === "Weekly" && (
                    <div className="space-y-2">
                      <Label htmlFor="week-day" className="text-sm font-medium text-slate-300">
                        Day of Week
                      </Label>
                      <Select value={weekDay} onValueChange={setWeekDay}>
                        <SelectTrigger className={`w-full bg-[#1e1d1d] border-white/20 text-white ${errors.weekDay ? 'border-red-500' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1d1d] border-white/20">
                          {weekDays.map((day) => (
                            <SelectItem key={day} value={day} className="text-white">
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.weekDay && <p className="text-red-400 text-xs">{errors.weekDay}</p>}
                    </div>
                  )}

                  {swapFrequency === "Monthly" && (
                    <div className="space-y-2">
                      <Label htmlFor="month-date" className="text-sm font-medium text-slate-300">
                        Day of Month (1-31)
                      </Label>
                      <Input
                        id="month-date"
                        type="number"
                        value={monthDate}
                        onChange={(e) => setMonthDate(e.target.value)}
                        placeholder="e.g., 15"
                        min="1"
                        max="31"
                        className={`bg-[#1e1d1d] border-white/20 text-white placeholder:text-white/50 ${errors.monthDate ? 'border-red-500' : ''}`}
                      />
                      {errors.monthDate && <p className="text-red-400 text-xs">{errors.monthDate}</p>}
                    </div>
                  )}
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
                  <h3 className="font-semibold text-slate-300 mb-3">Recent Actions</h3>
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
                disabled={isDelegating || isAuthorizing || !sessionAccount}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isDelegating || isAuthorizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isDelegating ? "Sending MetaMask Transaction..." : "Processing..."}
                  </>
                ) : (
                  "🔥 Delegate & Create Real Swap Rule"
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
