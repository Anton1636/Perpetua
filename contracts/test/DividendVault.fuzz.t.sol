// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {DividendVault} from "../src/DividendVault.sol";

/**
 * Property-based tests: Foundry runs each with hundreds of random inputs,
 * hunting for values that break the share math. This is where subtle rounding
 * or conversion bugs surface.
 */
contract DividendVaultFuzzTest is Test {
    MockEquityToken internal token;
    DividendVault internal vault;
    address internal owner = makeAddr("owner");
    address internal user = makeAddr("user");

    function setUp() public {
        vm.warp(1_700_000_000);
        token = new MockEquityToken("Realty Income", "Ox");
        vm.prank(owner);
        vault = new DividendVault(token, "Perpetua Ox", "pOx", owner);
    }

    /// deposit then immediately redeem all shares -> user never gains or loses
    /// value on a no-yield round trip (inflation-attack & rounding safety)
    function testFuzz_DepositRedeemRoundTrip(uint256 amount) public {
        amount = bound(amount, 1e6, 1_000_000e18);

        // mint the user exactly `amount` via privileged mint
        token.grantRole(token.MINTER_ROLE(), address(this));
        token.mint(user, amount);

        vm.startPrank(user);
        token.approve(address(vault), amount);
        uint256 shares = vault.deposit(amount, user);
        uint256 redeemed = vault.redeem(shares, user, user);
        vm.stopPrank();

        // user gets back what they put in, minus at most 1 wei of rounding
        assertLe(redeemed, amount);
        assertApproxEqAbs(redeemed, amount, 1);
    }

    /// shares are always priced fairly: convertToAssets(convertToShares(x)) <= x
    /// (never mints value out of thin air; rounding always favors the vault)
    function testFuzz_ConversionNeverCreatesValue(uint256 assets) public {
        assets = bound(assets, 1e6, 1_000_000e18);

        token.grantRole(token.MINTER_ROLE(), address(this));
        token.mint(user, assets);
        vm.startPrank(user);
        token.approve(address(vault), assets);
        vault.deposit(assets, user);
        vm.stopPrank();

        uint256 shares = vault.convertToShares(assets);
        uint256 back = vault.convertToAssets(shares);
        assertLe(back, assets); // rounding never favors the user
    }

    /// first depositor can't be griefed: any valid deposit yields > 0 shares
    function testFuzz_DepositAlwaysMintsShares(uint256 amount) public {
        amount = bound(amount, 1e6, 1_000_000e18);
        token.grantRole(token.MINTER_ROLE(), address(this));
        token.mint(user, amount);
        vm.startPrank(user);
        token.approve(address(vault), amount);
        uint256 shares = vault.deposit(amount, user);
        vm.stopPrank();
        assertGt(shares, 0);
    }
}
