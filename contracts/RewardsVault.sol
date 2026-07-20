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

    // Add this right here:
    function setOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
