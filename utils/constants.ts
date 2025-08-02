// Contract constants for EIP-7702 Session Delegator
export const CONTRACT_ADDRESS = '0x8A4131A7197fE6fDf638914B8a2d90F7B7198c83' as const;

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "startSession",
    "inputs": [
      {"name": "key", "type": "address"},
      {"name": "_swapToken", "type": "address"},
      {"name": "_swapAmount", "type": "uint256"},
      {"name": "_duration", "type": "uint256"},
      {"name": "_gasFee", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sessionId",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nonce",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "session",
    "inputs": [{"name": "", "type": "uint256"}],
    "outputs": [
      {"name": "key", "type": "address"},
      {"name": "swapToken", "type": "address"},
      {"name": "expiresAt", "type": "uint48"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isExistingKey",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isKeyAuthorized",
    "inputs": [{"name": "_sessionId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "SessionStarted",
    "inputs": [
      {"name": "key", "type": "address", "indexed": true},
      {"name": "_swapToken", "type": "address", "indexed": false},
      {"name": "swapAmount", "type": "uint256", "indexed": false},
      {"name": "expiresAt", "type": "uint256", "indexed": false}
    ]
  }
] as const;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;