import { z } from "zod";

// Validate Vite env vars at startup so a missing key fails loudly with a clear
// message instead of breaking deep in the app. Tightened (made required) on Day 17.
const schema = z.object({
  VITE_WALLETCONNECT_PROJECT_ID: z.string().min(1).optional(),
  VITE_SEPOLIA_RPC_URL: z.string().url().optional(),
});

export const env = schema.parse(import.meta.env);
