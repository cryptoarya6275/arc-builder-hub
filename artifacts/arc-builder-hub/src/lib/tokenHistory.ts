import { useState, useEffect, useCallback } from "react";

export interface DeployedToken {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  contractAddress: string;
  txHash: string;
  deployedAt: number;
  chainId: number;
}

const STORAGE_KEY = "arc_deployed_tokens";
const MAX_ENTRIES = 50;

function load(): DeployedToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DeployedToken[];
  } catch {
    return [];
  }
}

function save(tokens: DeployedToken[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.slice(0, MAX_ENTRIES)));
  } catch {
    // storage quota — silently ignore
  }
}

export function useTokenHistory() {
  const [tokens, setTokens] = useState<DeployedToken[]>(() => load());

  const addToken = useCallback((entry: Omit<DeployedToken, "id" | "deployedAt">) => {
    const newToken: DeployedToken = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      deployedAt: Date.now(),
    };
    setTokens((prev) => {
      const updated = [newToken, ...prev].slice(0, MAX_ENTRIES);
      save(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTokens([]);
  }, []);

  const removeToken = useCallback((id: string) => {
    setTokens((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  return { tokens, addToken, clearHistory, removeToken };
}

export function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
