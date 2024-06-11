// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract WDonut is ERC20, ERC20Burnable, Ownable {
    constructor(address initial_Owner)
        ERC20("WDonut", "WDNT") // Updated name and symbol
        Ownable(initial_Owner)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Only owner (the bridge) can burn tokens from a user.
    function burn(address from, uint256 amount) public onlyOwner {
        burnFrom(from, amount);
    }
}
