import { defineConfig } from "@wagmi/cli";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Abi } from "viem";

// Read ABIs straight from Foundry's compiled artifacts (no need to invoke forge
// from Windows — the artifacts already exist in contracts/out/).
function abiFrom(contract: string, file?: string): Abi {
  const f = file ?? contract;
  const path = resolve(__dirname, `../contracts/out/${f}.sol/${contract}.json`);
  return JSON.parse(readFileSync(path, "utf8")).abi as Abi;
}

export default defineConfig({
  out: "src/shared/web3/generated.ts",
  contracts: [
    { name: "DividendVault", abi: abiFrom("DividendVault") },
    { name: "MockEquityToken", abi: abiFrom("MockEquityToken") },
    { name: "VaultFactory", abi: abiFrom("VaultFactory") },
    { name: "AutoCompounder", abi: abiFrom("AutoCompounder") },
    { name: "ZapRouter", abi: abiFrom("ZapRouter") },
  ],
});
