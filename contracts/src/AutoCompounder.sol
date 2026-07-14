// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DividendVault} from "./DividendVault.sol";

/**
 * @title AutoCompounder
 * @notice Permissionless keeper. Anyone can call poke(vault) to trigger a
 *         harvest; the caller is rewarded a small share of the harvested yield.
 *         This decentralizes the "cron job" — bots keep vaults compounding
 *         without the team pressing a button.
 *
 * @dev The reward comes out of the vault owner's fee stream conceptually; in this
 *      demo the keeper simply earns a bps cut recorded per call. Kept simple for
 *      the testnet — production would pay from the performance fee.
 */
contract AutoCompounder {
    /// @notice reward for a successful poke, in basis points of harvested yield
    uint256 public constant KEEPER_REWARD_BPS = 50; // 0.5%
    uint256 private constant BPS = 10_000;

    /// @notice minimum seconds between pokes per vault (avoid spam / dust harvests)
    uint256 public constant MIN_INTERVAL = 1 hours;

    mapping(address => uint256) public lastPoke;

    event Poked(
        address indexed vault,
        address indexed keeper,
        uint256 harvested,
        uint256 reward
    );

    error TooSoon(uint256 nextAllowed);

    /**
     * @notice Trigger a harvest on `vault`. Rate-limited per vault.
     * @return harvested net yield streamed by the harvest
     */
    function poke(DividendVault vault) external returns (uint256 harvested) {
        uint256 next = lastPoke[address(vault)] + MIN_INTERVAL;
        if (block.timestamp < next && lastPoke[address(vault)] != 0) {
            revert TooSoon(next);
        }
        lastPoke[address(vault)] = block.timestamp;

        harvested = vault.harvest();
        uint256 reward = (harvested * KEEPER_REWARD_BPS) / BPS;

        emit Poked(address(vault), msg.sender, harvested, reward);
    }

    /// @notice View whether a vault can be poked right now.
    function canPoke(address vault) external view returns (bool) {
        return
            lastPoke[vault] == 0 ||
            block.timestamp >= lastPoke[vault] + MIN_INTERVAL;
    }
}
