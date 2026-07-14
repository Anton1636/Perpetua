// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {MockYieldSource} from "../src/MockYieldSource.sol";

contract MockYieldSourceTest is Test {
    MockEquityToken internal token;
    MockYieldSource internal source;
    address internal vault = makeAddr("vault");

    function setUp() public {
        vm.warp(1_700_000_000);
        token = new MockEquityToken("Realty Income", "Ox");
        source = new MockYieldSource(token, 830); // 8.30%
        token.grantRole(token.MINTER_ROLE(), address(source));
    }

    function test_PendingYieldZeroBeforeStart() public view {
        // not started -> no yield accrues
        assertEq(source.pendingYield(vault), 0);
    }

    function test_PendingYieldAccruesAfterStart() public {
        // give the vault some principal, then start the clock
        token.grantRole(token.MINTER_ROLE(), address(this));
        token.mint(vault, 1_000e18);
        source.start(vault);

        vm.warp(block.timestamp + 365 days);
        // ~8.30% of 1000 = ~83
        assertApproxEqRel(source.pendingYield(vault), 83e18, 0.01e18);
    }

    function test_HarvestMintsYieldToVault() public {
        token.grantRole(token.MINTER_ROLE(), address(this));
        token.mint(vault, 1_000e18);
        source.start(vault);

        vm.warp(block.timestamp + 365 days);
        uint256 balanceBefore = token.balanceOf(vault);
        source.harvest(vault);
        uint256 delivered = token.balanceOf(vault) - balanceBefore;

        assertApproxEqRel(delivered, 83e18, 0.01e18);
    }

    function test_StartIsIdempotent() public {
        source.start(vault);
        uint256 first = source.lastHarvest(vault);
        vm.warp(block.timestamp + 1 hours);
        source.start(vault); // second call must NOT reset the clock
        assertEq(source.lastHarvest(vault), first);
    }
}
