// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./RewardsVault.sol";

contract MiningSession {
    struct MinerInfo {
        uint256 shares;        // valid proofs submitted
        uint256 rewardsClaimed;
    }

    address public owner;
    RewardsVault public immutable vault;

    uint256 public currentEpoch;
    uint256 public target;            // difficulty target (lower = harder)
    uint256 public rewardPerShare;    // reward units per valid share

    mapping(address => MinerInfo) public miners;
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public usedNonce; 
    // epoch => miner => nonce => used

    event EpochStarted(uint256 epoch, uint256 target, uint256 rewardPerShare);
    event ShareSubmitted(address indexed miner, uint256 epoch, uint256 nonce, bytes32 hash);
    event RewardsClaimed(address indexed miner, uint256 amount);
    event ParamsUpdated(uint256 target, uint256 rewardPerShare);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _vault, uint256 _initialTarget, uint256 _rewardPerShare) {
        owner = msg.sender;
        vault = RewardsVault(_vault);
        target = _initialTarget;
        rewardPerShare = _rewardPerShare;
        currentEpoch = 1;
        emit EpochStarted(currentEpoch, target, rewardPerShare);
    }

    function startNewEpoch(uint256 _target, uint256 _rewardPerShare) external onlyOwner {
        currentEpoch += 1;
        target = _target;
        rewardPerShare = _rewardPerShare;
        emit EpochStarted(currentEpoch, target, rewardPerShare);
    }

    function updateParams(uint256 _target, uint256 _rewardPerShare) external onlyOwner {
        target = _target;
        rewardPerShare = _rewardPerShare;
        emit ParamsUpdated(_target, _rewardPerShare);
    }

    function submitShare(uint256 nonce) external {
        require(!usedNonce[currentEpoch][msg.sender][nonce], "Nonce used");

        // Keccak-256 proof-of-work style hash
        bytes32 h = keccak256(abi.encodePacked(msg.sender, currentEpoch, nonce));

        require(uint256(h) < target, "Difficulty not met");

        usedNonce[currentEpoch][msg.sender][nonce] = true;

        MinerInfo storage miner = miners[msg.sender];
        miner.shares += 1;

        emit ShareSubmitted(msg.sender, currentEpoch, nonce, h);
    }

    function pendingRewards(address minerAddr) public view returns (uint256) {
        MinerInfo memory m = miners[minerAddr];
        uint256 total = m.shares * rewardPerShare;
        return total - m.rewardsClaimed;
    }

    function claimRewards() external {
        uint256 amount = pendingRewards(msg.sender);
        require(amount > 0, "No rewards");

        miners[msg.sender].rewardsClaimed += amount;

        vault.payMiner(msg.sender, amount);

        emit RewardsClaimed(msg.sender, amount);
    }
}
