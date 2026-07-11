// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IYieldSource} from "./IYieldSource.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DividendVault
 * @notice ERC-4626 vault for a tokenized dividend equity. Users deposit the
 *         equity token and receive vault shares that appreciate as yield is
 *         harvested and compounded (DRIP). Yield comes from a pluggable
 *         IYieldSource; a performance fee (bps) is taken from harvested yield.
 *
 * Security:
 * * Yield model (demo): the MockYieldSource MINTS yield directly into the vault
 * (push model), so deposited assets intentionally stay in the vault and are not
 * forwarded anywhere. In production with real securities-lending, capital would
 * instead be DEPLOYED to the source (approve + transfer) — see audit MEDIUM#03
 * and docs/ARCHITECTURE.md.
 * - OZ ERC4626 with a virtual-shares decimals offset (inflation-attack resistant).
 * - Pausable deposits (guardian can freeze new inflows in an emergency).
 * - Ownable for admin actions (moves to multisig+timelock on mainnet — see README).
 */
contract DividendVault is ERC4626, Ownable, Pausable {
    using SafeERC20 for IERC20;
    IYieldSource public yieldSource;

    /// @notice performance fee on harvested yield, in basis points (0–2000)
    uint256 public performanceFeeBps;

    /// @notice recipient of performance fees
    address public feeRecipient;

    uint256 public constant MAX_FEE_BPS = 2_000; // 20% hard cap
    uint256 private constant BPS = 10_000;

    event Harvested(uint256 grossYield, uint256 fee, uint256 netCompounded);
    event PerformanceFeeUpdated(uint256 newFeeBps);
    event YieldSourceUpdated(address indexed newSource);

    error FeeTooHigh();
    error ZeroAddress();

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(owner_) {
        feeRecipient = owner_;
    }

    /// @dev virtual shares offset — OZ default is 0; we use 6 to harden against
    ///      the first-depositor inflation attack.
    function _decimalsOffset() internal pure override returns (uint8) {
        return 6;
    }

    // --- admin ---

    function setYieldSource(IYieldSource source) external onlyOwner {
        if (address(source) == address(0)) revert ZeroAddress();
        yieldSource = source;
        emit YieldSourceUpdated(address(source));
    }

    function setPerformanceFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        performanceFeeBps = newFeeBps;
        emit PerformanceFeeUpdated(newFeeBps);
    }

    function setFeeRecipient(address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        feeRecipient = recipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- yield ---
    /**
     * @notice Pull yield from the source, take the performance fee, and leave the
     *         rest in the vault — which raises assets-per-share for everyone (DRIP).
     * @dev Yield is measured by the ACTUAL change in the vault's asset balance,
     *      never by the yield source's self-reported return value (a malicious
     *      source could otherwise report fake gains to drain fees from deposits).
     *      See audit HIGH#01.
     */
    function harvest() external whenNotPaused returns (uint256 netCompounded) {
        // cache storage reads (gas)
        IYieldSource source = yieldSource;
        require(address(source) != address(0), "no yield source");

        IERC20 assetToken = IERC20(asset());

        // measure real delivery: balance after - balance before (audit HIGH#01)
        uint256 balanceBefore = assetToken.balanceOf(address(this));
        source.harvest(address(this));
        uint256 grossYield = assetToken.balanceOf(address(this)) -
            balanceBefore;

        if (grossYield == 0) {
            emit Harvested(0, 0, 0);
            return 0;
        }

        uint256 fee = (grossYield * performanceFeeBps) / BPS;
        if (fee > 0) {
            // SafeERC20 for non-standard tokens like USDT (audit MEDIUM#04)
            assetToken.safeTransfer(feeRecipient, fee);
        }
        netCompounded = grossYield - fee;
        // net yield stays in the vault -> totalAssets up -> shares appreciate.
        // NOTE (audit HIGH#02): this raises share price atomically, which is
        // sandwich-able. A streaming/drip distribution (yield released per-second)
        // is the proper mitigation — planned for the keeper on Day 13. Documented
        // as a known limitation for the demo.
        emit Harvested(grossYield, fee, netCompounded);
    }

    // --- pausable deposits ---

    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused returns (uint256) {
        return super.deposit(assets, receiver);
    }

    function mint(
        uint256 shares,
        address receiver
    ) public override whenNotPaused returns (uint256) {
        return super.mint(shares, receiver);
    }
}
