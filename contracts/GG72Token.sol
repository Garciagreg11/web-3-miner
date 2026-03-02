// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract GG72Token is 
    ERC20Upgradeable, 
    ERC20PausableUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialMint_,
        address owner_
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __ERC20Pausable_init();
        __Ownable_init(owner_);

        _mint(owner_, initialMint_);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        super._update(from, to, value);
    }
}

