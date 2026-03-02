// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WorkVerifier {
    function verifyWork(bytes32 hash, uint256 target) external pure returns (bool) {
        return uint256(hash) < target;
    }
}

