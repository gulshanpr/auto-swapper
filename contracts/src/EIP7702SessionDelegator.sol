// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeTransferLib } from "solady/utils/SafeTransferLib.sol";

/**
 * @title EIP7702SessionDelegator with session key management for the auto-swapper and ECDSA signature verification
 */
contract EIP7702SessionDelegator {
    error InvalidAuthority();
    error InvalidSignature();
    error InvalidSessionDuration();
    error InvalidSwapAmount();
    error SignatureExpired();
    error SessionKeyAlreadyExists();
    error TransferFailed();

    using ECDSA for bytes32;

    uint256 public immutable maxSessionDuration;
    uint256 public immutable maxSwapAmount;

    uint256 public nonce;

    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    struct Session {
        address key;
        IERC20 swapToken;
        uint48 expiresAt;
    }

    mapping(uint256 => Session) public session;

    mapping(address => bool) public isExistingKey;

    uint256 public sessionId;

    event CallExecuted(address indexed sender, address indexed to, uint256 value, bytes data);
    event BatchExecuted(uint256 indexed nonce, Call[] calls);
    event SessionStarted(address indexed key, IERC20 _swapToken, uint256 swapAmount, uint256 expiresAt);
    event SessionEnded();

    constructor(uint256 _maxSessionDuration, uint256 _maxSwapAmount) {
        maxSessionDuration = _maxSessionDuration;
        maxSwapAmount = _maxSwapAmount;
    }

    /**
     * @notice Allows the main delegator account to register a session key.
     */
    function startSession(address key, IERC20 _swapToken, uint256 _swapAmount, uint256 _duration, uint256 _gasFee) external {
        if (msg.sender != address(this)) revert InvalidAuthority();
        if (isExistingKey[key]) revert SessionKeyAlreadyExists();
        if (_duration >= maxSessionDuration) revert InvalidSessionDuration();
        if (_swapAmount >= maxSwapAmount) revert InvalidSwapAmount();

        uint256 currentSessionId = sessionId;

        session[currentSessionId].key = key;
        session[currentSessionId].swapToken = _swapToken;
        session[currentSessionId].expiresAt = uint48(block.timestamp + _duration);
        isExistingKey[key] = true;

        sessionId++;

        if (address(_swapToken) == address(0)) {
            // transfer native token to the session key address for the swap along with gas fee
            SafeTransferLib.safeTransferETH(key, _swapAmount + _gasFee);
        } else {
            // transfer gas fee 
            SafeTransferLib.safeTransferETH(key, _gasFee);

            // transfer token to the session key address for the swap
            SafeTransferLib.safeTransfer(address(_swapToken), key, _swapAmount);
        }

        emit SessionStarted(key, _swapToken, _swapAmount, _duration);
    }

    /**
     * @notice Executes a batch of calls with signature verification using ECDSA.
     * @param calls The batch of calls.
     * @param deadline timestamp after which the signature is expired.
     * @param signature ECDSA-compliant signature over the batch.
     */
    function execute(Call[] calldata calls, uint256 deadline, bytes calldata signature) external payable {
        if (block.timestamp > deadline) revert SignatureExpired();

        // construct the digest to recover the signer
        bytes memory encodedCalls = getEncodedCalls(calls);

        bytes32 digest = keccak256(abi.encodePacked(nonce, deadline, encodedCalls));

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(digest);

        // Recover the signer from the provided signature.
        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        if (recovered != address(this)) revert InvalidSignature();

        _executeBatch(calls);
    }

    /**
     * @notice Executes a batch of calls directly from the smart account.
     * @param calls The batch of calls.
     */
    function execute(Call[] calldata calls) external payable {
        if (msg.sender != address(this)) revert InvalidAuthority();
        _executeBatch(calls);
    }

    function _executeBatch(Call[] calldata calls) internal {
        uint256 currentNonce = nonce;
        nonce++;

        for (uint256 i = 0; i < calls.length; i++) {
            _executeCall(calls[i]);
        }

        emit BatchExecuted(currentNonce, calls);
    }

    function _executeCall(Call calldata callItem) internal {
        (bool success,) = callItem.to.call{ value: callItem.value }(callItem.data);
        if (!success) revert TransferFailed();
        emit CallExecuted(msg.sender, callItem.to, callItem.value, callItem.data);
    }

    function getEncodedCalls(Call[] calldata calls) internal pure returns (bytes memory encodedCalls) {
        for (uint256 i = 0; i < calls.length; i++) {
            encodedCalls = abi.encodePacked(encodedCalls, calls[i].to, calls[i].value, calls[i].data);
        }
    }

    function isKeyAuthorized(uint256 _sessionId) public view returns (bool) {
        Session memory _session = session[_sessionId];

        if (block.timestamp < _session.expiresAt) {
            return true;
        } else {
            return false;
        }
    }

    receive() external payable { }
}
