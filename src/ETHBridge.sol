// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ETHBridge is Ownable {
    event Lock(address indexed _from, uint256 indexed _amount);

    IERC20 public donut; // Changed variable name for clarity
    mapping(address => uint256) public balances;

    constructor(address _donut) Ownable(msg.sender) {
        donut = IERC20(_donut); // Donut token address deployed on Sepolia
    }

    // User must approve the ETHBridge contract on the Donut token contract first.
    function lock(address _tokenAddress, uint256 _amount) public {
        require(_amount > 0, "Amount cannot be zero");
        require(_tokenAddress == address(donut), "Invalid token address");
        require(
          IERC20(_tokenAddress).allowance(msg.sender, address(this)) >= _amount,
          "Please approve tokens first"
        );
        // Transfer Donut tokens from user to this contract
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    // Called by the relayer after tokens are burned on the BSC side
    function burnedOnOtherSide(address _user, uint256 _amount) external onlyOwner {
        balances[_user] += _amount;
    }

    // After the relayer credits the user, they can unlock their Donut tokens.
    function unlock(address _tokenAddress, uint256 _amount) public {
        require(_amount > 0, "Amount cannot be zero");
        require(_amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] -= _amount;
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
    }
}
