// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BSCBridge} from "../src/BSCBridge.sol";
import {ETHBridge} from "../src/ETHBridge.sol";
import {Donut} from "../src/Token.sol";
import {WDonut} from "../src/Wtoken.sol";

contract DeployScript is Script {
    function deployTokens() public returns (Donut donut, WDonut wdonut) {
        // Deploy tokens
        donut = new Donut();
        wdonut = new WDonut(vm.addr(vm.envUint("PRIVATE_KEY")));

        console2.log("Donut token deployed to:", address(donut));
        console2.log("WDonut token deployed to:", address(wdonut));
    }

    function deployBridges(address donut, address wdonut) public returns (ETHBridge ethBridge, BSCBridge bscBridge) {
        // Deploy bridges
        ethBridge = new ETHBridge(donut);
        bscBridge = new BSCBridge(wdonut);

        console2.log("ETH Bridge deployed to:", address(ethBridge));
        console2.log("BSC Bridge deployed to:", address(bscBridge));
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy tokens
        (Donut donut, WDonut wdonut) = deployTokens();

        // Deploy bridges
        (ETHBridge ethBridge, BSCBridge bscBridge) = deployBridges(address(donut), address(wdonut));

        // Transfer WDonut ownership to BSC Bridge
        wdonut.transferOwnership(address(bscBridge));

        vm.stopBroadcast();        

        // all address
        console2.log("Donut token deployed to:", address(donut));
        console2.log("WDonut token deployed to:", address(wdonut));
        console2.log("ETH Bridge deployed to:", address(ethBridge));
        console2.log("BSC Bridge deployed to:", address(bscBridge));
    }
}
