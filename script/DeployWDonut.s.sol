// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {WDonut} from "../src/Wtoken.sol";

contract DeployWDonutScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy WDonut token
        WDonut wdonut = new WDonut(vm.addr(deployerPrivateKey));

        vm.stopBroadcast();

        console2.log("WDonut token deployed to:", address(wdonut));
    }
} 