// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract RewardsVault {
    address public owner;
    IERC20 public rewardToken;

    constructor(address _rewardToken) {
        owner = msg.sender;
        rewardToken = IERC20(_rewardToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Send rewards to a miner
    function distribute(address miner, uint256 amount) external onlyOwner {
        require(rewardToken.transfer(miner, amount), "Transfer failed");
    }
}




contract MiningSession {
    struct MinerEpochInfo {
        uint256 shares;
        bool claimed;
    }

    RewardsVault public vault;
    
    address public owner;
    address public devWallet;          // Your wallet address where you get paid
    uint256 public devFeeBps = 500;    // 500 Basis Points = 5% developer fee

    uint256 public currentEpoch;
    uint256 public target;
    uint256 public rewardPerShare;
    uint256 public difficulty;

    // FIX: Tracks shares and claim status per user PER epoch to prevent past-work exploits
    mapping(uint256 => mapping(address => MinerEpochInfo)) public epochMiners;
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public usedNonce;

    event EpochStarted(uint256 epoch, uint256 target, uint256 rewardPerShare);
    event ShareSubmitted(address indexed miner, uint256 epoch, uint256 nonce, bytes32 hash);
    event RewardsClaimed(address indexed miner, uint256 epoch, uint256 minerAmount, uint256 devAmount);
    event DifficultyUpdated(uint256 difficulty, uint256 newTarget);
    event ParamsUpdated(uint256 rewardPerShare);
    event DevWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event DevFeeUpdated(uint256 oldFee, uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        address _vault,
        address _devWallet,
        uint256 _initialDifficulty,
        uint256 _rewardPerShare
    ) {
        require(_vault != address(0), "Invalid vault address");
        require(_devWallet != address(0), "Invalid dev wallet address");
        
        owner = msg.sender;
        devWallet = _devWallet;
        vault = RewardsVault(_vault);

        difficulty = _initialDifficulty;
        target = type(uint256).max >> _initialDifficulty;

        rewardPerShare = _rewardPerShare;
        currentEpoch = 1;

        emit EpochStarted(currentEpoch, target, rewardPerShare);
    }

    // ---------------- ADMIN ----------------

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        require(_difficulty > 0 && _difficulty < 256, "Invalid difficulty");
        difficulty = _difficulty;
        target = type(uint256).max >> _difficulty;

        emit DifficultyUpdated(_difficulty, target);
    }

    function startNewEpoch(uint256 _rewardPerShare) external onlyOwner {
        currentEpoch += 1;
        rewardPerShare = _rewardPerShare;

        // target stays tied to global difficulty configuration
        target = type(uint256).max >> difficulty;

        emit EpochStarted(currentEpoch, target, rewardPerShare);
    }

    function updateParams(uint256 _rewardPerShare) external onlyOwner {
        rewardPerShare = _rewardPerShare;
        emit ParamsUpdated(_rewardPerShare);
    }

    function setDevWallet(address _newDevWallet) external onlyOwner {
        require(_newDevWallet != address(0), "Invalid address");
        emit DevWalletUpdated(devWallet, _newDevWallet);
        devWallet = _newDevWallet;
    }

    function setDevFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 2000, "Fee cannot exceed 20%"); // Security cap to maintain user trust
        emit DevFeeUpdated(devFeeBps, _newFeeBps);
        devFeeBps = _newFeeBps;
    }

    // ---------------- MINING ----------------

    function submitShare(uint256 nonce) external {
        require(!usedNonce[currentEpoch][msg.sender][nonce], "Nonce used");

        bytes32 h = keccak256(abi.encodePacked(msg.sender, currentEpoch, nonce));
        require(uint256(h) < target, "Difficulty not met");

        usedNonce[currentEpoch][msg.sender][nonce] = true;
        epochMiners[currentEpoch][msg.sender].shares += 1;

        emit ShareSubmitted(msg.sender, currentEpoch, nonce, h);
    }

    // ---------------- REWARDS ----------------

    function pendingRewards(uint256 epoch, address minerAddr) public view returns (uint256) {
        MinerEpochInfo memory m = epochMiners[epoch][minerAddr];
        if (m.claimed) return 0;
        return m.shares * rewardPerShare;
    }

    function claimRewards(uint256 epoch) external {
        uint256 totalReward = pendingRewards(epoch, msg.sender);
        require(totalReward > 0, "No rewards or already claimed");

        // Mark as claimed BEFORE transferring tokens to prevent reentrancy exploits
        epochMiners[epoch][msg.sender].claimed = true;

        // Calculate developer fee division (BIPs math)
        uint256 devShare = (totalReward * devFeeBps) / 10000;
        uint256 minerShare = totalReward - devShare;

        // Distribute payouts seamlessly from the RewardsVault
        if (devShare > 0) {
            vault.distribute(devWallet, devShare);
        }
        vault.distribute(msg.sender, minerShare);

        emit RewardsClaimed(msg.sender, epoch, minerShare, devShare);
    }

    // ---------------- FRONTEND SUPPORT ----------------

    function getShares(uint256 epoch, address miner) external view returns (uint256) {
        return epochMiners[epoch][miner].shares;
    }

    function getWork()
        external
        view
        returns (
            uint256 epoch,
            uint256 difficultyOut,
            uint256 targetOut
        )
    {
        return (currentEpoch, difficulty, target);
    }

    function epochHash(address miner, uint256 nonce) external view returns (bytes32) {
        return keccak256(abi.encodePacked(miner, currentEpoch, nonce));
    }
}
