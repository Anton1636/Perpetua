const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";
const SEPOLIA_CHAIN_ID = 11155111;

export type VerifyStatus = "verified" | "unverified" | "unavailable";

export async function checkVerified(address: string): Promise<VerifyStatus> {
  const key = import.meta.env.VITE_ETHERSCAN_API_KEY as string | undefined;
  if (!key) return "unavailable";

  try {
    const url = `${ETHERSCAN_V2}?chainid=${SEPOLIA_CHAIN_ID}&module=contract&action=getabi&address=${address}&apikey=${key}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === "1" && typeof json.result === "string" && json.result.startsWith("[")) {
      return "verified";
    }
    if (typeof json.result === "string" && json.result.includes("not verified")) {
      return "unverified";
    }
    return "unavailable";
  } catch {
    return "unavailable";
  }
}
