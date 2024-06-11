// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Updated interface to reflect WDonut token functionality
interface IWDONUT is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract BSCBridge is Ownable {
     
    event Burned(address indexed addr, uint indexed amount);

    IWDONUT public WDonut;

    mapping(address => uint256) public balance;

    constructor(address _WDonut) Ownable(msg.sender) {
        WDonut = IWDONUT(_WDonut);
    }
    
    // Users call withdraw to mint their wrapped Donut tokens on BSC Testnet
    function withdraw(uint256 amount) public {
        require(balance[msg.sender] >= amount, "Insufficient balance");
        balance[msg.sender] -= amount;
        WDonut.mint(msg.sender, amount);
    }

    // Users call burned after approving the bridge contract to burn their WDonut tokens.
    // Make sure to approve the token burn before calling this function.
    function burned(uint256 amount) public {
        require(WDonut.balanceOf(msg.sender) >= amount, "Please submit tokens");
        WDonut.burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    } 

    // Called by the relayer after a lock event is detected on the opposite chain.
    // Credits the user's balance on BSC Testnet.
    function lockOnOppositeChain(address user, uint256 amount) public onlyOwner {
        balance[user] += amount;
    }
}
