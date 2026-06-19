// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WorkVerifier {
    mapping(bytes32 => bool) public usedWork;

    function verifyWork(bytes32 workHash, uint256 target) external returns (bool) {
        require(!usedWork[workHash], "Duplicate work");
        usedWork[workHash] = true;
        return uint256(workHash) < target;
    }
}
