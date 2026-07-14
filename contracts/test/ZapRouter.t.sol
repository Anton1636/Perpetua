// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {DividendVault} from "../src/DividendVault.sol";
import {ZapRouter} from "../src/ZapRouter.sol";

contract ZapRouterTest is Test {
    MockEquityToken internal tokenA;
    MockEquityToken internal tokenB;
    DividendVault internal vaultA;
    DividendVault internal vaultB;
    ZapRouter internal router;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");

    function setUp() public {
        vm.warp(1_700_000_000);
        tokenA = new MockEquityToken("Realty Income", "Ox");
        tokenB = new MockEquityToken("Coca-Cola", "KOx");

        vm.startPrank(owner);
        vaultA = new DividendVault(tokenA, "Perpetua Ox", "pOx", owner);
        vaultB = new DividendVault(tokenB, "Perpetua KOx", "pKOx", owner);
        vm.stopPrank();

        router = new ZapRouter();

        // fund alice with both tokens
        vm.startPrank(alice);
        tokenA.faucet(); // 10_000e18
        tokenB.faucet(); // 10_000e18
        vm.stopPrank();
    }

    function test_ZapIntoTwoVaultsInOneCall() public {
        ZapRouter.ZapItem[] memory items = new ZapRouter.ZapItem[](2);
        items[0] = ZapRouter.ZapItem({
            vault: address(vaultA),
            amount: 1_000e18
        });
        items[1] = ZapRouter.ZapItem({
            vault: address(vaultB),
            amount: 2_000e18
        });

        vm.startPrank(alice);
        tokenA.approve(address(router), 1_000e18);
        tokenB.approve(address(router), 2_000e18);
        router.zapDeposit(items);
        vm.stopPrank();

        // alice holds shares in BOTH vaults after one zap call
        assertGt(vaultA.balanceOf(alice), 0);
        assertGt(vaultB.balanceOf(alice), 0);
        assertEq(vaultA.totalAssets(), 1_000e18);
        assertEq(vaultB.totalAssets(), 2_000e18);
    }

    function test_RouterHoldsNoFundsAfterZap() public {
        ZapRouter.ZapItem[] memory items = new ZapRouter.ZapItem[](1);
        items[0] = ZapRouter.ZapItem({
            vault: address(vaultA),
            amount: 1_000e18
        });

        vm.startPrank(alice);
        tokenA.approve(address(router), 1_000e18);
        router.zapDeposit(items);
        vm.stopPrank();

        // non-custodial: router keeps nothing
        assertEq(tokenA.balanceOf(address(router)), 0);
    }

    function test_RevertsOnEmptyBatch() public {
        ZapRouter.ZapItem[] memory items = new ZapRouter.ZapItem[](0);
        vm.prank(alice);
        vm.expectRevert(ZapRouter.NothingToZap.selector);
        router.zapDeposit(items);
    }

    function test_RevertsOnZeroAmount() public {
        ZapRouter.ZapItem[] memory items = new ZapRouter.ZapItem[](1);
        items[0] = ZapRouter.ZapItem({vault: address(vaultA), amount: 0});
        vm.startPrank(alice);
        tokenA.approve(address(router), 1_000e18);
        vm.expectRevert(ZapRouter.ZeroAmount.selector);
        router.zapDeposit(items);
        vm.stopPrank();
    }

    function test_PreviewMatchesActualShares() public {
        ZapRouter.ZapItem[] memory items = new ZapRouter.ZapItem[](2);
        items[0] = ZapRouter.ZapItem({
            vault: address(vaultA),
            amount: 1_000e18
        });
        items[1] = ZapRouter.ZapItem({
            vault: address(vaultB),
            amount: 2_000e18
        });

        uint256 predicted = router.previewZap(items);

        vm.startPrank(alice);
        tokenA.approve(address(router), 1_000e18);
        tokenB.approve(address(router), 2_000e18);
        uint256 actual = router.zapDeposit(items);
        vm.stopPrank();

        assertEq(actual, predicted); // preview == execution
    }

    function test_RevertsOnZeroVault() public {
        ZapRouter.ZapItem[] memory items = new ZapRouter.ZapItem[](1);
        items[0] = ZapRouter.ZapItem({vault: address(0), amount: 1_000e18});
        vm.prank(alice);
        vm.expectRevert(ZapRouter.InvalidVault.selector);
        router.zapDeposit(items);
    }
}
