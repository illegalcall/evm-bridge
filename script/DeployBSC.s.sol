// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BSCBridge} from "../src/BSCBridge.sol";
import {WDonut} from "../src/Wtoken.sol";

contract DeployBSCScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy WDonut token and BSC Bridge on BSC testnet
        WDonut wdonut = new WDonut(vm.addr(deployerPrivateKey));
        BSCBridge bscBridge = new BSCBridge(address(wdonut));

        // Transfer WDonut ownership to BSC Bridge
        wdonut.transferOwnership(address(bscBridge));

        vm.stopBroadcast();

        console2.log("WDonut token deployed to:", address(wdonut));
        console2.log("BSC Bridge deployed to:", address(bscBridge));
    }
} 