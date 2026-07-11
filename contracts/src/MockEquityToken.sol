// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MockEquityToken
 * @notice Testnet stand-in for a tokenized dividend equity (e.g. a Realty Income
 *         or Coca-Cola token). NOT a real security — for Sepolia demo only.
 *
 * Design notes / audit responses:
 * - The faucet is intentionally permissionless (it dispenses worthless testnet
 *   tokens). A cooldown is added for realism + cleaner UX, not as a security
 *   control. Vault inflation-attack resistance is handled where it belongs — in
 *   the ERC-4626 vault (decimals offset), not here.
 * - DEFAULT_ADMIN_ROLE is held by the deployer EOA for the demo. On mainnet this
 *   role moves to a multisig + timelock (see README "Path to production").
 */
contract MockEquityToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice tokens dispensed per faucet call
    uint256 public constant FAUCET_AMOUNT = 10_000 * 1e18;

    /// @notice minimum time between faucet claims per address
    uint256 public constant FAUCET_COOLDOWN = 8 hours;

    /// @notice last faucet claim timestamp per address
    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed claimer, uint256 amount);

    error FaucetCooldownActive(uint256 availableAt);

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Mint yourself test tokens. Permissionless by design; rate-limited
    ///         per address for realism and to keep the demo tidy.
    function faucet() external {
        uint256 last = lastFaucetClaim[msg.sender];
        if (last != 0) {
            uint256 nextAllowed = last + FAUCET_COOLDOWN;
            if (block.timestamp < nextAllowed) {
                revert FaucetCooldownActive(nextAllowed);
            }
        }
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Privileged mint (vault yield). Restricted to MINTER_ROLE holders.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
