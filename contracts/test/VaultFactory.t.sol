// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DividendVault} from "../src/DividendVault.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// A token whose symbol is too long — used to test factory input validation.
contract LongSymbolToken is ERC20 {
    constructor() ERC20("Bad", "THIS_SYMBOL_IS_WAY_TOO_LONG") {}
}

contract VaultFactoryTest is Test {
    VaultFactory internal factory;
    MockEquityToken internal token;
    address internal owner = makeAddr("owner");

    function setUp() public {
        factory = new VaultFactory();
        token = new MockEquityToken("Realty Income", "Ox");
    }

    function test_CreatesVaultForAsset() public {
        address vault = factory.createVault(token, owner);
        assertEq(factory.vaultFor(address(token)), vault);
        assertEq(factory.vaultCount(), 1);
        // share token metadata derives from the asset
        assertEq(DividendVault(vault).symbol(), "pOx");
        assertEq(DividendVault(vault).owner(), owner);
    }

    function test_RevertsOnDuplicateAsset() public {
        factory.createVault(token, owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                VaultFactory.VaultAlreadyExists.selector,
                address(token)
            )
        );
        factory.createVault(token, owner);
    }

    function test_RevertsOnZeroOwner() public {
        vm.expectRevert(VaultFactory.ZeroAddress.selector);
        factory.createVault(token, address(0));
    }

    function test_TracksMultipleVaults() public {
        MockEquityToken token2 = new MockEquityToken("Coca-Cola", "KOx");
        factory.createVault(token, owner);
        factory.createVault(token2, owner);
        assertEq(factory.vaultCount(), 2);
        assertTrue(
            factory.vaultFor(address(token)) !=
                factory.vaultFor(address(token2))
        );
    }

    function test_RevertsOnTooLongSymbol() public {
        LongSymbolToken bad = new LongSymbolToken();
        vm.expectRevert(VaultFactory.InvalidSymbol.selector);
        factory.createVault(bad, owner);
    }
}
