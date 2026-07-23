import { useQuery } from "@tanstack/react-query";
import { useViewedAddress } from "@/features/watch/useViewedAddress";
import { querySubgraph } from "@/shared/web3/subgraph";
import { VAULTS } from "@/shared/web3/addresses";
import { useOnChainPositions } from "@/entities/position/chain";
import { computePnL, buildHistory, type PnLResult, type HistoryPoint } from "./pnl-math";

// The demo subgraph indexes one vault (see subgraph.yaml). Production would use
// factory templates to index every vault the factory creates.
const INDEXED_VAULT = VAULTS[0];

interface SubgraphPosition {
  totalDeposited: string;
  totalWithdrawn: string;
}
interface SubgraphTx {
  kind: string;
  amount: string;
  timestamp: string;
}

const QUERY = `
  query PositionHistory($id: ID!, $user: Bytes!) {
    position(id: $id) { totalDeposited totalWithdrawn }
    transactions(where: { user: $user }, orderBy: timestamp, orderDirection: asc, first: 200) {
      kind amount timestamp
    }
  }
`;

export function usePnL(): {
  pnl: PnLResult | null;
  history: HistoryPoint[];
  currentValue: bigint;
  isLoading: boolean;
  symbol: string;
} {
  const { address } = useViewedAddress();
  const { data: chainPositions } = useOnChainPositions();

  const { data, isLoading } = useQuery({
    queryKey: ["pnl", address],
    enabled: !!address,
    staleTime: 20_000,
    queryFn: async () => {
      const user = address!.toLowerCase();
      return querySubgraph<{ position: SubgraphPosition | null; transactions: SubgraphTx[] }>(
        QUERY,
        {
          id: `${user}-${INDEXED_VAULT.vault.toLowerCase()}`,
          user,
        },
      );
    },
  });

  const currentValue =
    chainPositions?.find((p) => p.vaultAddress.toLowerCase() === INDEXED_VAULT.vault.toLowerCase())
      ?.assets ?? 0n;

  if (!data?.position) {
    return { pnl: null, history: [], currentValue, isLoading, symbol: INDEXED_VAULT.symbol };
  }

  const pnl = computePnL({
    currentValue,
    totalDeposited: BigInt(data.position.totalDeposited),
    totalWithdrawn: BigInt(data.position.totalWithdrawn),
  });

  const history = buildHistory(
    (data.transactions ?? []).map((t) => ({
      kind: t.kind,
      amount: BigInt(t.amount),
      timestamp: Number(t.timestamp),
    })),
  );

  return { pnl, history, currentValue, isLoading, symbol: INDEXED_VAULT.symbol };
}
