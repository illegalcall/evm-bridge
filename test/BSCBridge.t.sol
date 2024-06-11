// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {BSCBridge} from "../src/BSCBridge.sol";
import {ETHBridge} from "../src/ETHBridge.sol";
import {Donut} from "../src/Token.sol";
import {WDonut} from "../src/Wtoken.sol";

contract BridgeTest is Test {
    BSCBridge public bscBridge;
    ETHBridge public ethBridge;
    Donut public donut;
    WDonut public wdonut;

    address public owner;
    address public user1;
    address public user2;

    uint256 public constant INITIAL_AMOUNT = 1000e18;
    uint256 public constant BRIDGE_AMOUNT = 100e18;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy contracts
        donut = new Donut();
        wdonut = new WDonut(owner);
        ethBridge = new ETHBridge(address(donut));
        bscBridge = new BSCBridge(address(wdonut));

        // Transfer ownership of WDonut to BSC Bridge
        wdonut.transferOwnership(address(bscBridge));

        // Mint initial tokens to users
        donut.mint(user1, INITIAL_AMOUNT);
        donut.mint(user2, INITIAL_AMOUNT);
    }

    // ETHBridge Tests
    function test_LockTokens() public {
        vm.startPrank(user1);
        donut.approve(address(ethBridge), BRIDGE_AMOUNT);
        ethBridge.lock(address(donut), BRIDGE_AMOUNT);
        vm.stopPrank();

        assertEq(donut.balanceOf(address(ethBridge)), BRIDGE_AMOUNT);
        assertEq(donut.balanceOf(user1), INITIAL_AMOUNT - BRIDGE_AMOUNT);
    }

    function test_UnlockTokens() public {
        // First lock tokens
        vm.startPrank(user1);
        donut.approve(address(ethBridge), BRIDGE_AMOUNT);
        ethBridge.lock(address(donut), BRIDGE_AMOUNT);
        vm.stopPrank();

        // Simulate relayer action
        ethBridge.burnedOnOtherSide(user1, BRIDGE_AMOUNT);

        // Unlock tokens
        vm.prank(user1);
        ethBridge.unlock(address(donut), BRIDGE_AMOUNT);

        assertEq(donut.balanceOf(user1), INITIAL_AMOUNT);
        assertEq(donut.balanceOf(address(ethBridge)), 0);
    }

    // BSCBridge Tests
    function test_WithdrawTokens() public {
        // Simulate tokens being locked on ETH chain
        vm.prank(owner);
        bscBridge.lockOnOppositeChain(user1, BRIDGE_AMOUNT);

        // User withdraws wrapped tokens
        vm.prank(user1);
        bscBridge.withdraw(BRIDGE_AMOUNT);

        assertEq(wdonut.balanceOf(user1), BRIDGE_AMOUNT);
    }

    function test_BurnTokens() public {
        // First get some wrapped tokens
        vm.prank(owner);
        bscBridge.lockOnOppositeChain(user1, BRIDGE_AMOUNT);
        
        vm.startPrank(user1);
        bscBridge.withdraw(BRIDGE_AMOUNT);
        wdonut.approve(address(bscBridge), BRIDGE_AMOUNT);
        bscBridge.burned(BRIDGE_AMOUNT);
        vm.stopPrank();

        assertEq(wdonut.balanceOf(user1), 0);
    }

    // Failure cases
    function test_RevertWhen_LockWithoutApproval() public {
        vm.prank(user1);
        vm.expectRevert("Please approve tokens first");
        ethBridge.lock(address(donut), BRIDGE_AMOUNT);
    }

    function test_RevertWhen_UnlockWithoutBalance() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        ethBridge.unlock(address(donut), BRIDGE_AMOUNT);
    }

    function test_RevertWhen_WithdrawWithoutBalance() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        bscBridge.withdraw(BRIDGE_AMOUNT);
    }

    function test_RevertWhen_BurnWithoutBalance() public {
        vm.prank(user1);
        vm.expectRevert("Please submit tokens");
        bscBridge.burned(BRIDGE_AMOUNT);
    }

    function test_RevertWhen_UnauthorizedLockOnOppositeChain() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        bscBridge.lockOnOppositeChain(user2, BRIDGE_AMOUNT);
    }

    function test_RevertWhen_UnauthorizedBurnedOnOtherSide() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        ethBridge.burnedOnOtherSide(user2, BRIDGE_AMOUNT);
    }

    function test_RevertWhen_UnauthorizedDonutMint() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        donut.mint(user1, 100e18);
    }

    function test_RevertWhen_UnauthorizedWDonutMint() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        wdonut.mint(user1, 100e18);
    }

    // Token contract tests
    function test_DonutMint() public {
        uint256 mintAmount = 500e18;
        donut.mint(user1, mintAmount);
        assertEq(donut.balanceOf(user1), INITIAL_AMOUNT + mintAmount);
    }

    function test_WDonutMintAndBurn() public {
        uint256 mintAmount = 500e18;
        
        vm.prank(address(bscBridge));
        wdonut.mint(user1, mintAmount);
        assertEq(wdonut.balanceOf(user1), mintAmount);

        vm.startPrank(user1);
        wdonut.approve(address(bscBridge), mintAmount);
        vm.stopPrank();

        vm.prank(address(bscBridge));
        wdonut.burn(user1, mintAmount);
        assertEq(wdonut.balanceOf(user1), 0);
    }

    receive() external payable {}
}
