// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {DividendVault} from "../src/DividendVault.sol";

/**
 * Invariant tests enforce the statements in docs/INVARIANTS.md under ANY random
 * sequence of actions Foundry throws at the handler. This is what catches whole
 * classes of logic bugs (e.g. share-price manipulation) rather than single cases.
 */
contract DividendVaultInvariantTest is Test {
    MockEquityToken internal token;
    DividendVault internal vault;
    VaultHandler internal handler;
    address internal owner = makeAddr("owner");

    function setUp() public {
        vm.warp(1_700_000_000);
        token = new MockEquityToken("Realty Income", "Ox");
        vm.prank(owner);
        vault = new DividendVault(token, "Perpetua Ox", "pOx", owner);

        handler = new VaultHandler(vault, token);
        token.grantRole(token.MINTER_ROLE(), address(handler));

        // only fuzz the handler's entry points
        targetContract(address(handler));
    }

    /// V1 (solvency): the vault's asset balance always covers what it owes
    /// (totalAssets never exceeds real token balance held).
    function invariant_Solvency() public view {
        assertGe(token.balanceOf(address(vault)), vault.totalAssets());
    }

    /// V2 (no free value): total redeemable assets never exceed total deposited
    /// principal tracked by the handler (no yield in this run => conservation).
    function invariant_NoValueCreatedWithoutYield() public view {
        uint256 redeemable = vault.convertToAssets(vault.totalSupply());
        assertLe(redeemable, handler.totalDeposited() + 1); // +1 wei rounding
    }

    /// When all shares are burned, at most a rounding dust remains (a few wei).
    /// ERC-4626 with a decimals offset intentionally rounds in the vault's favor
    /// — that dust is WHY the inflation attack is unprofitable. The invariant is
    /// therefore "no meaningful assets are stranded", not "exactly zero".
    function invariant_NoMeaningfulAssetsStranded() public view {
        if (vault.totalSupply() == 0) {
            // dust tolerance: a handful of wei from rounding, never real value
            assertLe(vault.totalAssets(), 10);
        }
    }
}

/**
 * Handler: the only surface the invariant fuzzer can call. Bounds inputs so the
 * fuzzer explores realistic deposit/withdraw sequences across many actors.
 */
contract VaultHandler is Test {
    DividendVault public vault;
    MockEquityToken public token;
    uint256 public totalDeposited;

    address[] internal actors;

    constructor(DividendVault vault_, MockEquityToken token_) {
        vault = vault_;
        token = token_;
        for (uint256 i = 0; i < 3; i++) {
            actors.push(makeAddr(string.concat("actor", vm.toString(i))));
        }
    }

    function deposit(uint256 actorSeed, uint256 amount) external {
        address actor = actors[actorSeed % actors.length];
        amount = bound(amount, 1e6, 100_000e18);

        token.mint(actor, amount);
        vm.startPrank(actor);
        token.approve(address(vault), amount);
        vault.deposit(amount, actor);
        vm.stopPrank();

        totalDeposited += amount;
    }

    function withdraw(uint256 actorSeed, uint256 shares) external {
        address actor = actors[actorSeed % actors.length];
        uint256 bal = vault.balanceOf(actor);
        if (bal == 0) return;
        shares = bound(shares, 1, bal);

        vm.startPrank(actor);
        uint256 assets = vault.redeem(shares, actor, actor);
        vm.stopPrank();

        totalDeposited = totalDeposited > assets ? totalDeposited - assets : 0;
    }
}
