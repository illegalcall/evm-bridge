// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {ETHBridge} from "../src/ETHBridge.sol";
import {Donut} from "../src/Token.sol";

contract DeployETHScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Donut token and ETH Bridge on Sepolia
        Donut donut = new Donut();
        ETHBridge ethBridge = new ETHBridge(address(donut));

        vm.stopBroadcast();

        console2.log("Donut token deployed to:", address(donut));
        console2.log("ETH Bridge deployed to:", address(ethBridge));
    }
} 