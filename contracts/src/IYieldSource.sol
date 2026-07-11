// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IYieldSource
 * @notice Abstraction over where a vault's yield comes from. In production this
 *         is implemented by a dividend pass-through adapter and/or a securities-
 *         lending adapter (one per issuer). The vault stays agnostic to the
 *         source — it just calls harvest() and receives assets.
 */
interface IYieldSource {
    /// @notice Pull accrued yield into `vault`. Returns the amount delivered (assets).
    function harvest(address vault) external returns (uint256 yieldAmount);

    /// @notice View the yield accrued and claimable so far, without harvesting.
    function pendingYield(address vault) external view returns (uint256);
}
