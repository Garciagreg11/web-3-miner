// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract RewardsVault is Initializable, OwnableUpgradeable {
    IERC20 public rewardToken;
    address public miningContract;

    event Funded(address indexed from, uint256 amount);
    event MiningContractSet(address indexed miningContract);
    event RewardPaid(address indexed miner, uint256 amount);

    function initialize(address _rewardToken) public initializer {
        __Ownable_init(msg.sender);
        rewardToken = IERC20(_rewardToken);
    }

    modifier onlyMiningContract() {
        require(msg.sender == miningContract, "Not mining contract");
        _;
    }

    function setMiningContract(address _miningContract) external onlyOwner {
        miningContract = _miningContract;
        emit MiningContractSet(_miningContract);
    }

    function fund(uint256 amount) external {
        require(amount > 0, "Zero amount");
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        emit Funded(msg.sender, amount);
    }

    function payMiner(address miner, uint256 amount) external onlyMiningContract {
        require(amount > 0, "Zero amount");
        require(
            rewardToken.transfer(miner, amount),
            "Reward transfer failed"
        );
        emit RewardPaid(miner, amount);
    }
}

