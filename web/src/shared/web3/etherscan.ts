// Checks whether a contract is source-verified on Sepolia Etherscan. Uses the
// public API (no key needed for this endpoint at low volume). Falls back to
// "unknown" gracefully so the UI never breaks on a rate-limit.
export type VerifyStatus = "verified" | "unverified" | "unknown";

export async function checkVerified(address: string): Promise<VerifyStatus> {
  try {
    const url = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${address}`;
    const res = await fetch(url);
    const json = await res.json();
    // status "1" + a real ABI string => verified
    if (json.status === "1" && typeof json.result === "string" && json.result.startsWith("[")) {
      return "verified";
    }
    if (json.result === "Contract source code not verified") return "unverified";
    return "unknown";
  } catch {
    return "unknown";
  }
}
