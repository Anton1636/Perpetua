// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IYieldSource} from "./IYieldSource.sol";
import {MockEquityToken} from "./MockEquityToken.sol";

/**
 * @title MockYieldSource
 * @notice Simulates yield on testnet: accrues at a fixed annual rate on the
 *         vault's asset balance and mints the underlying token to deliver it.
 *         In production this would instead forward real dividend payments and
 *         securities-lending income. NOT real yield.
 */
contract MockYieldSource is IYieldSource {
    MockEquityToken public immutable asset;

    /// @notice annual yield rate in basis points (e.g. 830 = 8.30%)
    uint256 public immutable rateBps;

    /// @notice last harvest timestamp per vault
    mapping(address => uint256) public lastHarvest;

    uint256 private constant YEAR = 365 days;
    uint256 private constant BPS = 10_000;

    constructor(MockEquityToken asset_, uint256 rateBps_) {
        asset = asset_;
        rateBps = rateBps_;
    }

    function pendingYield(address vault) public view returns (uint256) {
        uint256 last = lastHarvest[vault];
        if (last == 0) return 0; // not initialized until first harvest
        uint256 elapsed = block.timestamp - last;
        uint256 principal = asset.balanceOf(vault);
        // yield = principal * rate * elapsed / (BPS * YEAR)
        return (principal * rateBps * elapsed) / (BPS * YEAR);
    }

    function harvest(address vault) external returns (uint256 yieldAmount) {
        yieldAmount = pendingYield(vault);
        lastHarvest[vault] = block.timestamp;
        if (yieldAmount > 0) {
            // mint the simulated yield straight to the vault (requires MINTER_ROLE)
            asset.mint(vault, yieldAmount);
        }
    }

    /// @notice initialize the accrual clock for a vault (called once by the vault)
    function start(address vault) external {
        if (lastHarvest[vault] == 0) {
            lastHarvest[vault] = block.timestamp;
        }
    }
}
