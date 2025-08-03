import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createPublicClient, createWalletClient, http, formatEther, formatUnits, parseEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { CONTRACT_ADDRESS, CONTRACT_ABI, ZERO_ADDRESS } from '@/utils/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Delegation checking utility
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

export interface DelegationStatus {
  isDelegated: boolean;
  delegatedTo?: string;
  code?: string;
  error?: any;
}

export async function checkDelegationStatus(eoaAddress: string): Promise<DelegationStatus> {
  try {
    console.log('Checking delegation for:', eoaAddress);

    // Get the current code at the EOA address
    const code = await publicClient.getCode({
      address: eoaAddress as `0x${string}`
    })

    console.log('Raw code response:', code);

    // Check for EIP-7702 delegation (starts with 0xef0100)
    if (code && code !== '0x') {
      console.log('✅ EOA has code:', code);

      if (code.startsWith('0xef0100')) {
        const delegatedAddress = '0x' + code.slice(8);
        console.log('🎯 EIP-7702 delegation detected!');
        console.log('Delegated to contract:', delegatedAddress);
        return { isDelegated: true, delegatedTo: delegatedAddress };
      } else {
        console.log('⚠️ Has code but not EIP-7702 delegation');
        return { isDelegated: false, code };
      }
    } else {
      console.log('❌ EOA is not delegated (no code)');
      return { isDelegated: false };
    }
  } catch (error) {
    console.error('Error checking delegation:', error);
    return { isDelegated: false, error };
  }
}

// Token balance utilities
export interface TokenBalances {
  ETH: number;
  USDC: number;
}

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

// Base Sepolia USDC contract address - replace with actual address when available
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export async function fetchTokenBalances(walletAddress: string): Promise<TokenBalances> {
  try {
    console.log('Fetching balances for:', walletAddress);

    // Fetch ETH balance
    const ethBalance = await publicClient.getBalance({
      address: walletAddress as `0x${string}`,
    });

    // Fetch USDC balance
    const usdcBalance = await publicClient.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    // Get USDC decimals
    const usdcDecimals = await publicClient.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });

    // Format balances
    const formattedEthBalance = parseFloat(formatEther(ethBalance));
    const formattedUsdcBalance = parseFloat(formatUnits(usdcBalance as bigint, usdcDecimals as number));

    console.log('Balances fetched:', {
      ETH: formattedEthBalance,
      USDC: formattedUsdcBalance,
    });

    return {
      ETH: formattedEthBalance,
      USDC: formattedUsdcBalance,
    };
  } catch (error) {
    console.error('Error fetching token balances:', error);
    // Return zeros on error
    return {
      ETH: 0,
      USDC: 0,
    };
  }
}

// EIP-7702 Delegation Management
export interface DelegationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface SessionParams {
  sessionKeyAddress: string;
  swapToken?: string;
  swapAmount?: string;
  duration?: number;
  gasFee?: number;
}

// Create a wallet client with a given private key
function createWalletFromPrivateKey(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });
}

// Delegate EOA to contract (without starting session)
export async function delegateEOA(privateKey: string): Promise<DelegationResult> {
  try {
    const walletClient = createWalletFromPrivateKey(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('Invalid private key');
    }

    // Sign authorization to delegate EOA to the contract
    const authorization = await walletClient.signAuthorization({
      account,
      contractAddress: CONTRACT_ADDRESS,
      executor: 'self'
    });

    console.log('Authorization signed:', authorization);

    // Send simple transaction to apply delegation
    const hash = await walletClient.sendTransaction({
      authorizationList: [authorization],
      to: account.address,
      data: '0x',
      value: BigInt(0)
    });

    console.log('EOA delegated, transaction hash:', hash);
    return { success: true, transactionHash: hash };
  } catch (error) {
    console.error('Error in delegateEOA:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Delegate EOA to contract and start session
export async function delegateWithConnectedWallet(
  walletAddress: string,
  sessionParams: SessionParams
): Promise<DelegationResult> {
  try {
    console.log('Delegating with connected wallet:', walletAddress);

    // Create a public client for contract interaction
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    });

    // For now, we'll use delegation without private key (this would need MetaMask integration)
    // This is a placeholder - in real implementation, MetaMask would handle the EIP-7702 authorization

    console.log('Delegation with connected wallet - this would use MetaMask for EIP-7702 authorization');
    console.log('Session parameters:', sessionParams);

    // Simulate successful delegation for now
    // In real implementation, this would:
    // 1. Request MetaMask to sign EIP-7702 authorization
    // 2. Send transaction to apply delegation
    // 3. Call startSession on the delegated account

    return {
      success: true,
      transactionHash: '0x' + Math.random().toString(16).slice(2) // Placeholder
    };
  } catch (error) {
    console.error('Failed to delegate with connected wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function delegateAndStartSession(
  privateKey: string,
  sessionParams: SessionParams
): Promise<DelegationResult> {
  try {
    const walletClient = createWalletFromPrivateKey(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('Invalid private key');
    }

    const {
      sessionKeyAddress,
      swapToken = ZERO_ADDRESS,
      swapAmount = '0.001',
      duration = 300, // 5 minutes
      gasFee = 0
    } = sessionParams;

    // 1. Sign authorization to delegate EOA to the contract
    const authorization = await walletClient.signAuthorization({
      account,
      contractAddress: CONTRACT_ADDRESS,
      executor: 'self'
    });

    console.log('Authorization signed:', authorization);

    // 2. Call startSession on the delegated EOA
    const hash = await walletClient.writeContract({
      abi: CONTRACT_ABI,
      address: account.address,
      authorizationList: [authorization],
      functionName: 'startSession',
      args: [
        sessionKeyAddress as `0x${string}`,
        swapToken as `0x${string}`,
        parseEther(swapAmount),
        BigInt(duration),
        BigInt(gasFee)
      ]
    });

    console.log('Delegation and session started, transaction hash:', hash);
    return { success: true, transactionHash: hash };
  } catch (error) {
    console.error('Error in delegateAndStartSession:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Revoke delegation
export async function revokeDelegation(privateKey: string): Promise<DelegationResult> {
  try {
    const walletClient = createWalletFromPrivateKey(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('Invalid private key');
    }

    // Create authorization pointing to zero address to revoke
    const revokeAuthorization = await walletClient.signAuthorization({
      account,
      contractAddress: ZERO_ADDRESS,
      executor: 'self'
    });

    console.log('Revoke authorization signed:', revokeAuthorization);

    // Send transaction with revoke authorization
    const hash = await walletClient.sendTransaction({
      authorizationList: [revokeAuthorization],
      to: account.address,
      data: '0x',
      value: BigInt(0)
    });

    console.log('Delegation revoked, transaction hash:', hash);
    return { success: true, transactionHash: hash };
  } catch (error) {
    console.error('Error in revokeDelegation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get account address from private key
export function getAddressFromPrivateKey(privateKey: string): string | null {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    return account.address;
  } catch (error) {
    console.error('Error getting address from private key:', error);
    return null;
  }
}

// Validate private key format
export function isValidPrivateKey(privateKey: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}
