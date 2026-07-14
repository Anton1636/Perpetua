// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {DividendVault} from "./DividendVault.sol";

/**
 * @title VaultFactory
 * @notice Deploys one DividendVault per tokenized-equity asset. This is the
 *         emitter-agnostic core: any compliant ERC-20 equity token can get a
 *         vault, keyed by token ADDRESS (not ticker — tickers can be spoofed,
 *         addresses cannot). See docs/ARCHITECTURE.md.
 */
contract VaultFactory {
    /// @notice asset token => its vault (address(0) if none)
    mapping(address => address) public vaultFor;

    /// @notice all vaults created, for enumeration
    address[] public allVaults;

    event VaultCreated(
        address indexed asset,
        address indexed vault,
        address owner
    );

    error VaultAlreadyExists(address asset);
    error ZeroAddress();
    error InvalidSymbol();

    /**
     * @notice Create a vault for `asset`, owned by `owner`.
     * @dev One vault per asset. Share token name/symbol derive from the asset.
     */
    function createVault(
        IERC20Metadata asset,
        address owner
    ) external returns (address vault) {
        if (address(asset) == address(0) || owner == address(0))
            revert ZeroAddress();
        if (vaultFor[address(asset)] != address(0))
            revert VaultAlreadyExists(address(asset));

        // validate external metadata before trusting it:
        // reject empty or absurdly long symbols to avoid DoS / UI spoofing.
        string memory sym = asset.symbol();
        uint256 symLen = bytes(sym).length;
        if (symLen == 0 || symLen > 12) revert InvalidSymbol();

        string memory name = string.concat("Perpetua ", sym);
        string memory symbol = string.concat("p", sym);

        vault = address(new DividendVault(asset, name, symbol, owner));

        vaultFor[address(asset)] = vault;
        allVaults.push(vault);

        emit VaultCreated(address(asset), vault, owner);
    }

    function vaultCount() external view returns (uint256) {
        return allVaults.length;
    }
}
