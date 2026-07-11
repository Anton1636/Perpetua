// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {MockYieldSource} from "../src/MockYieldSource.sol";
import {DividendVault} from "../src/DividendVault.sol";

contract DividendVaultTest is Test {
    MockEquityToken internal token;
    MockYieldSource internal source;
    DividendVault internal vault;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant RATE_BPS = 830; // 8.30% APY

    function setUp() public {
        vm.warp(1_700_000_000);
        token = new MockEquityToken("Realty Income", "Ox");

        vm.prank(owner);
        vault = new DividendVault(token, "Perpetua Ox", "pOx", owner);

        source = new MockYieldSource(token, RATE_BPS);
        // vault mints yield through the source -> source needs MINTER_ROLE
        token.grantRole(token.MINTER_ROLE(), address(source));

        vm.prank(owner);
        vault.setYieldSource(source);
        source.start(address(vault));

        // give alice & bob tokens to deposit
        _fund(alice, 10_000e18);
        _fund(bob, 10_000e18);
    }

    function _fund(address who, uint256 amount) internal {
        vm.prank(who);
        token.faucet(); // 10_000e18
        if (amount > 10_000e18) revert("fund helper caps at faucet amount");
    }

    function _deposit(address who, uint256 amount) internal {
        vm.startPrank(who);
        token.approve(address(vault), amount);
        vault.deposit(amount, who);
        vm.stopPrank();
    }

    function test_DepositMintsShares() public {
        _deposit(alice, 1_000e18);
        assertEq(vault.balanceOf(alice), vault.previewDeposit(1_000e18));
        assertEq(vault.totalAssets(), 1_000e18);
    }

    function test_HarvestIncreasesAssetsPerShare() public {
        _deposit(alice, 1_000e18);
        uint256 sharesBefore = vault.balanceOf(alice);
        uint256 assetsBefore = vault.convertToAssets(sharesBefore);

        // one year passes, then harvest
        vm.warp(block.timestamp + 365 days);
        vault.harvest();

        uint256 assetsAfter = vault.convertToAssets(sharesBefore);
        assertGt(assetsAfter, assetsBefore); // shares appreciated (DRIP)
        // ~8.30% on 1000 = ~83 tokens of yield
        assertApproxEqRel(assetsAfter, 1_083e18, 0.01e18); // within 1%
    }

    function test_PerformanceFeeGoesToRecipient() public {
        vm.prank(owner);
        vault.setPerformanceFee(1_000); // 10%

        _deposit(alice, 1_000e18);
        vm.warp(block.timestamp + 365 days);

        uint256 feeRecipientBefore = token.balanceOf(owner);
        vault.harvest();
        uint256 feeReceived = token.balanceOf(owner) - feeRecipientBefore;

        // gross ~83, fee 10% ~8.3
        assertApproxEqRel(feeReceived, 8.3e18, 0.02e18);
    }

    function test_FeeCannotExceedCap() public {
        vm.prank(owner);
        vm.expectRevert(DividendVault.FeeTooHigh.selector);
        vault.setPerformanceFee(2_001);
    }

    function test_PauseBlocksDeposits() public {
        vm.prank(owner);
        vault.pause();

        vm.startPrank(alice);
        token.approve(address(vault), 1_000e18);
        vm.expectRevert(); // Pausable: paused
        vault.deposit(1_000e18, alice);
        vm.stopPrank();
    }

    function test_WithdrawReturnsAssets() public {
        _deposit(alice, 1_000e18);
        uint256 shares = vault.balanceOf(alice);

        vm.prank(alice);
        vault.redeem(shares, alice, alice);

        assertApproxEqAbs(token.balanceOf(alice), 10_000e18, 1); // back to start (±1 wei)
        assertEq(vault.balanceOf(alice), 0);
    }

    function test_TwoDepositorsShareYieldProportionally() public {
        _deposit(alice, 1_000e18);
        _deposit(bob, 3_000e18); // bob has 3x alice

        vm.warp(block.timestamp + 365 days);
        vault.harvest();

        uint256 aliceAssets = vault.convertToAssets(vault.balanceOf(alice));
        uint256 bobAssets = vault.convertToAssets(vault.balanceOf(bob));

        // bob's yield should be ~3x alice's yield
        uint256 aliceYield = aliceAssets - 1_000e18;
        uint256 bobYield = bobAssets - 3_000e18;
        assertApproxEqRel(bobYield, aliceYield * 3, 0.01e18);
    }

    function test_HarvestUsesRealBalanceNotReportedValue() public {
        // A yield source that under-delivers vs a normal harvest still can't cause
        // the vault to over-pay fees, because fees are computed from the real
        // balance delta, not the source's return value.
        vm.prank(owner);
        vault.setPerformanceFee(1_000); // 10%

        _deposit(alice, 1_000e18);
        uint256 vaultBalanceBefore = token.balanceOf(address(vault));

        // no time passes -> source delivers ~0 yield
        uint256 net = vault.harvest();

        // with (almost) no real yield delivered, no meaningful fee is taken and
        // user assets in the vault are not reduced
        assertEq(net, 0);
        assertEq(token.balanceOf(address(vault)), vaultBalanceBefore);
    }
}
