// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {MockYieldSource} from "../src/MockYieldSource.sol";
import {DividendVault} from "../src/DividendVault.sol";
import {AutoCompounder} from "../src/AutoCompounder.sol";

contract AutoCompounderTest is Test {
    MockEquityToken internal token;
    MockYieldSource internal source;
    DividendVault internal vault;
    AutoCompounder internal keeper;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bot = makeAddr("bot");

    function setUp() public {
        vm.warp(1_700_000_000);
        token = new MockEquityToken("Realty Income", "Ox");
        vm.prank(owner);
        vault = new DividendVault(token, "Perpetua Ox", "pOx", owner);

        source = new MockYieldSource(token, 830);
        token.grantRole(token.MINTER_ROLE(), address(source));
        vm.prank(owner);
        vault.setYieldSource(source);
        source.start(address(vault));

        keeper = new AutoCompounder();

        // alice deposits so there is principal to earn yield on
        vm.prank(alice);
        token.faucet();
        vm.startPrank(alice);
        token.approve(address(vault), 1_000e18);
        vault.deposit(1_000e18, alice);
        vm.stopPrank();
    }

    function test_PokeTriggersHarvest() public {
        vm.warp(block.timestamp + 365 days);

        vm.prank(bot);
        uint256 harvested = keeper.poke(vault);

        assertGt(harvested, 0); // yield was harvested via the keeper
    }

    function test_PokeRateLimited() public {
        vm.warp(block.timestamp + 365 days);
        vm.prank(bot);
        keeper.poke(vault);

        // immediate second poke reverts
        vm.prank(bot);
        vm.expectRevert();
        keeper.poke(vault);
    }

    function test_PokeWorksAgainAfterInterval() public {
        vm.warp(block.timestamp + 365 days);
        vm.prank(bot);
        keeper.poke(vault);

        vm.warp(block.timestamp + keeper.MIN_INTERVAL());
        vm.prank(bot);
        uint256 harvested = keeper.poke(vault);
        assertGe(harvested, 0); // second poke succeeds (may be small)
    }

    function test_CanPokeView() public {
        assertTrue(keeper.canPoke(address(vault))); // never poked -> true
        vm.warp(block.timestamp + 365 days);
        vm.prank(bot);
        keeper.poke(vault);
        assertFalse(keeper.canPoke(address(vault))); // just poked -> false
    }
}
