// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./extensions/ERC20Capped.sol";
import "./extensions/draft-ERC20Permit.sol";

contract TestToken is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) payable ERC20(name, symbol) ERC20Permit(name) {
        _mint(initialAccount, initialBalance);
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }
}
