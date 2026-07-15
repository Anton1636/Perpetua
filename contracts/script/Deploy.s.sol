// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockEquityToken} from "../src/MockEquityToken.sol";
import {MockYieldSource} from "../src/MockYieldSource.sol";
import {DividendVault} from "../src/DividendVault.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {AutoCompounder} from "../src/AutoCompounder.sol";
import {ZapRouter} from "../src/ZapRouter.sol";

/**
 * @notice Deploys the full Perpetua protocol to Sepolia:
 *         5 mock equity tokens, a vault per token (via factory), a yield source
 *         per vault, the keeper, and the zap router. Wires roles + config.
 *
 * Run:
 *   forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL \
 *     --private-key $PRIVATE_KEY --broadcast --verify
 */
contract DeployScript is Script {
    // token config: name, symbol, annual yield rate (bps)
    struct TokenConfig {
        string name;
        string symbol;
        uint256 rateBps;
    }

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        TokenConfig[5] memory configs = [
            TokenConfig("Realty Income", "Ox", 830),
            TokenConfig("Coca-Cola", "KOx", 630),
            TokenConfig("Johnson & Johnson", "JNJx", 610),
            TokenConfig("S&P 500 ETF", "SPYx", 450),
            TokenConfig("Apple", "AAPLx", 490)
        ];

        vm.startBroadcast(deployerKey);

        VaultFactory factory = new VaultFactory();
        AutoCompounder keeper = new AutoCompounder();
        ZapRouter router = new ZapRouter();

        console.log("VaultFactory:", address(factory));
        console.log("AutoCompounder:", address(keeper));
        console.log("ZapRouter:", address(router));

        for (uint256 i = 0; i < configs.length; i++) {
            TokenConfig memory c = configs[i];

            MockEquityToken token = new MockEquityToken(c.name, c.symbol);
            address vault = factory.createVault(token, deployer);
            MockYieldSource source = new MockYieldSource(token, c.rateBps);

            // vault mints yield through the source -> source needs MINTER_ROLE
            token.grantRole(token.MINTER_ROLE(), address(source));
            DividendVault(vault).setYieldSource(source);
            source.start(vault);

            console.log(string.concat(c.symbol, " token:"), address(token));
            console.log(string.concat(c.symbol, " vault:"), vault);
            console.log(string.concat(c.symbol, " source:"), address(source));
        }

        vm.stopBroadcast();
    }
}