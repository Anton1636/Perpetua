// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";

contract MockEquityTokenTest is Test {
    MockEquityToken internal token;
    address internal alice = makeAddr("alice");
    address internal vault = makeAddr("vault");

    event FaucetClaimed(address indexed claimer, uint256 amount);

    function setUp() public {
        // start at a realistic timestamp, not 0 (cooldown math relies on time)
        vm.warp(1_700_000_000);
        token = new MockEquityToken("Realty Income", "Ox");
    }

    function test_MetadataAndDecimals() public view {
        assertEq(token.name(), "Realty Income");
        assertEq(token.symbol(), "Ox");
        assertEq(token.decimals(), 18);
    }

    function test_FaucetMintsToCaller() public {
        vm.prank(alice);
        token.faucet();
        assertEq(token.balanceOf(alice), token.FAUCET_AMOUNT());
    }

    function test_FaucetEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit FaucetClaimed(alice, token.FAUCET_AMOUNT());
        vm.prank(alice);
        token.faucet();
    }

    function test_FaucetCooldownBlocksSecondClaim() public {
        vm.prank(alice);
        token.faucet();
        // immediate second claim reverts (cooldown active)
        vm.prank(alice);
        vm.expectRevert();
        token.faucet();
    }

    function test_FaucetWorksAfterCooldown() public {
        vm.prank(alice);
        token.faucet();
        vm.warp(block.timestamp + token.FAUCET_COOLDOWN());
        vm.prank(alice);
        token.faucet();
        assertEq(token.balanceOf(alice), token.FAUCET_AMOUNT() * 2);
    }

    function test_MintRevertsWithoutRole() public {
        // alice lacks MINTER_ROLE -> mint reverts (any revert reason is fine here)
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1e18);
    }

    function test_MintSucceedsWithRole() public {
        token.grantRole(token.MINTER_ROLE(), vault);
        vm.prank(vault);
        token.mint(alice, 500 * 1e18);
        assertEq(token.balanceOf(alice), 500 * 1e18);
    }
}
