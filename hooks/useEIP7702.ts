'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useSign7702Authorization } from '@privy-io/react-auth'; // 👈 This is the key!
import { createViemWalletClient, publicClient } from '@/utils/viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ZERO_ADDRESS } from '@/utils/constants';
import { createWalletClient, custom, parseEther } from 'viem';
import { baseSepolia } from '@/utils/viem';

export function useEIP7702() {
  const { wallets } = useWallets();
  const { signAuthorization } = useSign7702Authorization(); // 👈 Privy's hook

  const [loading, setLoading] = useState(false);
  const [delegationStatus, setDelegationStatus] = useState<{
    isDelegated: boolean;
    sessionId?: number;
    nonce?: number;
  } | null>(null);

  const wallet = wallets[0];

  // Check if EOA is delegated
  const checkDelegationStatus = async () => {
    if (!wallet?.address) return null;

    try {
      setLoading(true);

      // Check if EOA has code (is delegated)
      const code = await publicClient.getCode({
        address: wallet.address as `0x${string}`
      });

      if (!code || code === '0x') {
        const status = { isDelegated: false };
        setDelegationStatus(status);
        return status;
      }

      // Try to read contract state
      try {
        const [sessionId, nonce] = await Promise.all([
          publicClient.readContract({
            address: wallet.address as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'sessionId'
          }),
          publicClient.readContract({
            address: wallet.address as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'nonce'
          })
        ]);

        const status = {
          isDelegated: true,
          sessionId: Number(sessionId),
          nonce: Number(nonce)
        };
        setDelegationStatus(status);
        return status;
      } catch {
        const status = { isDelegated: true };
        setDelegationStatus(status);
        return status;
      }
    } catch (error) {
      console.error('Error checking delegation status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delegate EOA to contract using Privy embedded wallet
  // Delegate EOA to contract using Privy embedded wallet
  const delegateToContract = async () => {
    if (!wallet?.address) throw new Error("No wallet connected");

    try {
      setLoading(true);

      console.log("=== DELEGATION DEBUG ===");
      console.log("Wallet address:", wallet.address);
      console.log("Contract address:", CONTRACT_ADDRESS);
      console.log("Chain:", baseSepolia.id);

      // Check if this is a Privy embedded wallet
      if (!signAuthorization) {
        throw new Error(
          "signAuthorization function not available. " +
          "Make sure you are using a Privy embedded wallet (email/social login)."
        );
      }

      // Get current nonce for authorization
      const currentNonce = await publicClient.getTransactionCount({
        address: wallet.address as `0x${string}`,
      });
      console.log("Current nonce:", currentNonce);

      // Sign authorization for this EOA to delegate to CONTRACT_ADDRESS
      console.log("Signing authorization...");
      const privyAuth = await signAuthorization({
        contractAddress: CONTRACT_ADDRESS,
        chainId: baseSepolia.id,
        nonce: currentNonce, // ✅ exact nonce
      });

      console.log("Privy authorization:", privyAuth);

      // Build authorization object for viem
      const viemAuthorization = {
        chainId: privyAuth.chainId,
        address: privyAuth.address as `0x${string}`,
        nonce: privyAuth.nonce,
        yParity: privyAuth.yParity ?? (privyAuth.v === 28n ? 1 : 0),
        r: privyAuth.r as `0x${string}`,
        s: privyAuth.s as `0x${string}`,
      };
      console.log("Viem authorization:", viemAuthorization);

      // Create a viem wallet client directly from embedded provider
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(provider),
      });

      console.log("Sending EIP-7702 transaction (type 4)...");

      // Send as EIP‑7702 (type: 4) with authorizationList
      const hash = await walletClient.sendTransaction({
        account: wallet.address as `0x${string}`,
        to: wallet.address as `0x${string}`,
        value: 0n,
        type: "eip7702", // ✅ Use string instead of hex
        authorizationList: [viemAuthorization],
      });

      console.log("Transaction sent with hash:", hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);
      console.log("Transaction type in receipt:", receipt.type);

      // Check the code after delegation
      const codeAfter = await publicClient.getCode({
        address: wallet.address as `0x${string}`,
      });
      console.log("Delegated?", codeAfter?.startsWith("0xef0100"));

      await checkDelegationStatus();

      return hash;
    } catch (error) {
      console.error("Error delegating to contract:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Revoke delegation using Privy's authorization
  const revokeDelegation = async () => {
    if (!wallet?.address) throw new Error('No wallet connected');

    try {
      setLoading(true);

      console.log('Revoking delegation for:', wallet.address);

      // Get current nonce for authorization
      const currentNonce = await publicClient.getTransactionCount({
        address: wallet.address as `0x${string}`
      });

      // Use Privy's signAuthorization with zero address to revoke
      const revokeAuthorization = await signAuthorization({
        contractAddress: ZERO_ADDRESS, // Zero address revokes delegation
        chainId: baseSepolia.id,
        nonce: currentNonce + 1, // Increment for same-wallet transaction
      });

      console.log('Revoke authorization signed:', revokeAuthorization);

      // Get provider and send transaction
      const provider = await wallet.getEthereumProvider();
      const walletClient = createViemWalletClient(provider, wallet);

      // Send transaction with revoke authorization
      const hash = await walletClient.sendTransaction({
        to: wallet.address as `0x${string}`,
        value: BigInt(0),
        data: '0x',
        authorizationList: [revokeAuthorization],
      });

      console.log('Revoke transaction hash:', hash);

      // Wait for confirmation and update status
      await publicClient.waitForTransactionReceipt({ hash });
      await checkDelegationStatus();

      console.log('Delegation revoked successfully!');
      return hash;
    } catch (error) {
      console.error('Error revoking delegation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Start a session

  const startSession = async (params: {
    sessionKey: string;
    swapToken: string;
    swapAmount: string;
    duration: number;
    gasFee: string;
  }) => {
    if (!wallet?.address) throw new Error('No wallet connected');
    if (!delegationStatus?.isDelegated) throw new Error('EOA not delegated');

    try {
      setLoading(true);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createViemWalletClient(provider, wallet);

      //--------------------------------------------------------------------
      // 1.  If the EOA is NOT yet delegated try to get an authorization
      //--------------------------------------------------------------------
      const authorizationList: any[] = [];

      if (!delegationStatus?.isDelegated) {
        try {
          const auth = await provider.request({
            method: 'eth_signAuthorization',
            params: [{ contractAddress: CONTRACT_ADDRESS, executor: 'self' }],
          });
          authorizationList.push(auth);
        } catch (err: any) {
          // Wallet doesn’t expose the method - let the caller decide.
          console.error('Authorization signing failed:', err);
          throw new Error(
            'Wallet could not sign an EIP-7702 authorization – ' +
            'please delegate manually first or use a wallet ' +
            'that supports the Delegation Toolkit.'
          );
        }
      }

      const swapAmountWei = parseEther(params.swapAmount);
      const gasFeeWei = parseEther(params.gasFee);

      const ethValue =
        params.swapToken === ZERO_ADDRESS
          ? (swapAmountWei + gasFeeWei)
          : (gasFeeWei > BigInt(0) ? gasFeeWei : undefined);

      const writeContractParams: any = {
        address: wallet.address as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'startSession',
        args: [
          params.sessionKey as `0x${string}`,
          params.swapToken as `0x${string}`,
          swapAmountWei,
          BigInt(params.duration),
          gasFeeWei
        ]
      };

      if (authorizationList.length) {
        writeContractParams.authorizationList = authorizationList;
        writeContractParams.type = 4;             // SET_CODE (EIP-7702) tx
      }

      if (ethValue !== undefined) {
        writeContractParams.value = ethValue;
      }

      const hash = await walletClient.writeContract(writeContractParams);

      await publicClient.waitForTransactionReceipt({ hash });
      await checkDelegationStatus();

      return hash;
      // ... existing code ...
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Combined function: delegate + start session in one transaction
  const startSessionWithDelegation = async (params: {
    sessionKey: string;
    swapToken: string;
    swapAmount: string;
    duration: number;
    gasFee: string;
  }) => {
    if (!wallet?.address) throw new Error('No wallet connected');

    try {
      setLoading(true);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createViemWalletClient(provider, wallet);

      // Check if we need authorization
      const authorizationList: any[] = [];

      if (!delegationStatus?.isDelegated) {
        console.log('EOA not delegated, creating authorization...');

        const currentNonce = await publicClient.getTransactionCount({
          address: wallet.address as `0x${string}`
        });

        // Use Privy's signAuthorization for embedded EOAs
        const auth = await signAuthorization({
          contractAddress: CONTRACT_ADDRESS,
          chainId: baseSepolia.id,
          nonce: currentNonce + 1,
        });

        authorizationList.push(auth);
        console.log('Authorization created for startSession');
      }

      // Prepare transaction parameters
      const swapAmountWei = parseEther(params.swapAmount);
      const gasFeeWei = parseEther(params.gasFee);

      const ethValue = params.swapToken === ZERO_ADDRESS
        ? (swapAmountWei + gasFeeWei)
        : (gasFeeWei > BigInt(0) ? gasFeeWei : undefined);

      const writeContractParams: any = {
        address: wallet.address as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'startSession',
        args: [
          params.sessionKey as `0x${string}`,
          params.swapToken as `0x${string}`,
          swapAmountWei,
          BigInt(params.duration),
          gasFeeWei
        ]
      };

      // Add authorization if needed
      if (authorizationList.length) {
        writeContractParams.authorizationList = authorizationList;
        writeContractParams.type = 4; // EIP-7702 transaction type
      }

      if (ethValue !== undefined) {
        writeContractParams.value = ethValue;
      }

      // Execute the transaction
      const hash = await walletClient.writeContract(writeContractParams);

      await publicClient.waitForTransactionReceipt({ hash });
      await checkDelegationStatus(); // Update delegation status

      return hash;
    } catch (error) {
      console.error('Error starting session with delegation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    delegationStatus,
    loading,
    checkDelegationStatus,
    delegateToContract,
    startSession: startSessionWithDelegation, // 👈 New combined function
    revokeDelegation,
    walletAddress: wallet?.address
  };
} 
