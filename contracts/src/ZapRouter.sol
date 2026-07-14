// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ZapRouter
 * @notice Batches deposits into multiple ERC-4626 vaults in a single transaction.
 *         The user approves the router once per asset; the router pulls the
 *         tokens and deposits into each vault, minting shares directly to the user.
 *
 * @dev Stateless and non-custodial: the router never holds funds between calls.
 *      nonReentrant is applied as defense-in-depth (audit MEDIUM#01) — the router
 *      makes external calls to vaults in a loop, so we guard even though it holds
 *      no state today. Vault/asset addresses are validated (audit LOW#02).
 */
contract ZapRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct ZapItem {
        address vault; // ERC-4626 vault to deposit into
        uint256 amount; // amount of the vault's asset to deposit
    }

    event Zapped(
        address indexed user,
        uint256 itemCount,
        uint256 totalDeposited
    );

    error NothingToZap();
    error ZeroAmount();
    error InvalidVault();

    /**
     * @notice Deposit into multiple vaults in one call. Shares are minted to the
     *         caller. Requires the caller to have approved this router for each
     *         vault's underlying asset.
     * @param items list of (vault, amount) deposits
     * @return totalShares sum of shares minted across all vaults
     */
    function zapDeposit(
        ZapItem[] calldata items
    ) external nonReentrant returns (uint256 totalShares) {
        uint256 len = items.length; // cache length (gas)
        if (len == 0) revert NothingToZap();

        uint256 totalDeposited;
        for (uint256 i = 0; i < len; i++) {
            ZapItem calldata item = items[i];
            if (item.amount == 0) revert ZeroAmount();
            if (item.vault == address(0)) revert InvalidVault();

            IERC4626 vault = IERC4626(item.vault);
            address assetAddr = vault.asset();
            if (assetAddr == address(0)) revert InvalidVault();
            IERC20 asset = IERC20(assetAddr);

            // pull the asset from the user into the router
            asset.safeTransferFrom(msg.sender, address(this), item.amount);
            // approve the vault to take exactly this amount
            asset.forceApprove(item.vault, item.amount);
            // deposit; shares minted directly to the user
            totalShares += vault.deposit(item.amount, msg.sender);

            totalDeposited += item.amount;
        }

        emit Zapped(msg.sender, len, totalDeposited);
    }

    /**
     * @notice Preview total shares for a batch without executing (UI helper).
     */
    function previewZap(
        ZapItem[] calldata items
    ) external view returns (uint256 totalShares) {
        uint256 len = items.length;
        for (uint256 i = 0; i < len; i++) {
            totalShares += IERC4626(items[i].vault).previewDeposit(
                items[i].amount
            );
        }
    }
}
