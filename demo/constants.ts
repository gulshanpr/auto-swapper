
export const MAIN_PRIVATE_KEY = '';

// RPC URLs
export const BASE_RPC_URL = '';
export const ARBITRUM_RPC_URL = '';

// 1inch API Key
export const ONEINCH_API_KEY='';

// Contract address on Base mainnet
export const CONTRACT_ADDRESS = '';

// Token addresses
export const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const ARBITRUM_USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

// Demo settings
export const SWAP_AMOUNT = '200000'; // 0.2 USDC with 6 decimals
export const COUNTDOWN_SECONDS = 15; // Demo countdown time

// 1inch router address
export const ONEINCH_ROUTER = '0x111111125421ca6dc452d289314280a0f8842a65';

// Contract ABI
export const CONTRACT_ABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_maxSessionDuration",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_maxSwapAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "execute",
        "inputs": [
            {
                "name": "calls",
                "type": "tuple[]",
                "internalType": "struct EIP7702SessionDelegator.Call[]",
                "components": [
                    {
                        "name": "to",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "value",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "deadline",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "signature",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "execute",
        "inputs": [
            {
                "name": "calls",
                "type": "tuple[]",
                "internalType": "struct EIP7702SessionDelegator.Call[]",
                "components": [
                    {
                        "name": "to",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "value",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "isExistingKey",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isKeyAuthorized",
        "inputs": [
            {
                "name": "_sessionId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "maxSessionDuration",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "maxSwapAmount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "nonce",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "session",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "key",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "swapToken",
                "type": "address",
                "internalType": "contract IERC20"
            },
            {
                "name": "expiresAt",
                "type": "uint48",
                "internalType": "uint48"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "sessionId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "startSession",
        "inputs": [
            {
                "name": "key",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_swapToken",
                "type": "address",
                "internalType": "contract IERC20"
            },
            {
                "name": "_swapAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_duration",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_gasFee",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "BatchExecuted",
        "inputs": [
            {
                "name": "nonce",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "calls",
                "type": "tuple[]",
                "indexed": false,
                "internalType": "struct EIP7702SessionDelegator.Call[]",
                "components": [
                    {
                        "name": "to",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "value",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "CallExecuted",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "to",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SessionEnded",
        "inputs": [],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SessionStarted",
        "inputs": [
            {
                "name": "key",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "_swapToken",
                "type": "address",
                "indexed": false,
                "internalType": "contract IERC20"
            },
            {
                "name": "swapAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "expiresAt",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignature",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureLength",
        "inputs": [
            {
                "name": "length",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureS",
        "inputs": [
            {
                "name": "s",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "error",
        "name": "InvalidAuthority",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSessionDuration",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSignature",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSwapAmount",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SessionKeyAlreadyExists",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SignatureExpired",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TransferFailed",
        "inputs": []
    }
] as const;

// ERC20 ABI for token operations
export const ERC20_ABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    }
] as const;