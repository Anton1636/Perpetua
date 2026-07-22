const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL as string | undefined;

// Thin GraphQL client for the deployed subgraph (the indexer itself lives in
// perpetua/subgraph and runs on The Graph's servers — this only queries it).
// No Apollo/urql needed for the handful of queries this app makes.
export async function querySubgraph<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!SUBGRAPH_URL) throw new Error("VITE_SUBGRAPH_URL is not set");

  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "Subgraph query failed");
  }
  return json.data as T;
}
