// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {Donut} from "../src/Token.sol";

contract DeployDonutScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Donut token
        Donut donut = new Donut();

        vm.stopBroadcast();

        console2.log("Donut token deployed to:", address(donut));
    }
} 