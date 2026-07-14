// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IYieldSource} from "./IYieldSource.sol";

/**
 * @title DividendVault
 * @notice ERC-4626 vault for a tokenized dividend equity. Deposit the equity
 *         token, receive vault shares that appreciate as harvested yield is
 *         STREAMED into the vault (DRIP). Yield comes from a pluggable
 *         IYieldSource; a performance fee (bps) is taken from harvested yield.
 *
 * Anti-sandwich (audit HIGH#02): harvested yield is not credited instantly.
 * It is locked and released linearly over STREAM_DURATION, so share price rises
 * smoothly second-by-second. A deposit-before / withdraw-after sandwich around a
 * harvest captures ~nothing, because there is no atomic jump to capture.
 *
 * Yield model (demo): the MockYieldSource MINTS yield into the vault (push), so
 * deposited assets intentionally stay here. Production securities-lending would
 * DEPLOY capital to the source instead — see docs/ARCHITECTURE.md.
 *
 * Security: OZ ERC4626 with virtual-shares decimals offset (inflation-attack
 * resistant); Pausable deposits; Ownable admin (multisig+timelock on mainnet).
 */
contract DividendVault is ERC4626, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IYieldSource public yieldSource;

    uint256 public performanceFeeBps;
    address public feeRecipient;

    uint256 public constant MAX_FEE_BPS = 2_000;
    uint256 private constant BPS = 10_000;

    /// @notice how long harvested yield takes to fully vest into share price
    uint256 public constant STREAM_DURATION = 8 hours;

    /// @notice amount of yield still locked (unvested) at streamStart
    uint256 public lockedYield;
    /// @notice timestamp the current stream began
    uint256 public streamStart;

    event Harvested(uint256 grossYield, uint256 fee, uint256 netStreamed);
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

    function _decimalsOffset() internal pure override returns (uint8) {
        return 6;
    }

    // --- streaming accounting ---

    /// @notice yield still locked right now (linearly unlocks over the window)
    function lockedYieldNow() public view returns (uint256) {
        uint256 locked = lockedYield;
        if (locked == 0) return 0;
        uint256 elapsed = block.timestamp - streamStart;
        if (elapsed >= STREAM_DURATION) return 0;
        // remaining = locked * (1 - elapsed/duration)
        return locked - (locked * elapsed) / STREAM_DURATION;
    }

    /**
     * @notice Total assets = real balance MINUS the portion of harvested yield
     *         that hasn't vested yet. This is what makes share price rise smoothly
     *         instead of jumping on harvest.
     */
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this)) - lockedYieldNow();
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
     * @notice Harvest yield from the source and begin streaming it. Any yield
     *         still locked from a previous harvest is rolled into the new stream.
     * @dev Yield measured by real balance delta, never the source's self-report
     *      (audit HIGH#01).
     */
    function harvest() external whenNotPaused returns (uint256 netStreamed) {
        IYieldSource source = yieldSource;
        require(address(source) != address(0), "no yield source");

        IERC20 assetToken = IERC20(asset());
        uint256 balanceBefore = assetToken.balanceOf(address(this));
        source.harvest(address(this));
        uint256 grossYield = assetToken.balanceOf(address(this)) -
            balanceBefore;

        uint256 fee;
        if (grossYield > 0) {
            fee = (grossYield * performanceFeeBps) / BPS;
            if (fee > 0) assetToken.safeTransfer(feeRecipient, fee);
        }
        netStreamed = grossYield - fee;

        // roll any still-locked yield into a fresh stream + the new net yield
        lockedYield = lockedYieldNow() + netStreamed;
        streamStart = block.timestamp;

        emit Harvested(grossYield, fee, netStreamed);
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
