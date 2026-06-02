import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { AuditResult } from "../middle-service/audit";
import { listAuditResults } from "../middle-service/audit";

// ============================================================================
// Types
// ============================================================================

interface AuditHistoryState {
  history: AuditResult[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

interface AuditHistoryActions {
  fetchHistory: () => Promise<void>;
  prependResult: (result: AuditResult) => void;
  removeResult: (id: string) => void;
}

type AuditHistoryStore = AuditHistoryState & AuditHistoryActions;

// Stale time: 30 seconds — avoid re-fetching on every render
const STALE_TIME_MS = 30_000;

// ============================================================================
// Store
// ============================================================================

export const useAuditHistoryStore = create<AuditHistoryStore>()((set, get) => ({
  history: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchHistory: async () => {
    const { lastFetchedAt, isLoading } = get();
    if (isLoading) return;
    if (lastFetchedAt && Date.now() - lastFetchedAt < STALE_TIME_MS) return;

    set({ isLoading: true, error: null });
    try {
      const history = await listAuditResults(0, 50);
      set({ history, isLoading: false, lastFetchedAt: Date.now() });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load audit history";
      console.error("Failed to fetch audit history:", error);
      set({ error: message, isLoading: false });
    }
  },

  prependResult: (result: AuditResult) => {
    set((state) => ({
      history: [result, ...state.history.filter((r) => r.id !== result.id)],
    }));
  },

  removeResult: (id: string) => {
    set((state) => ({
      history: state.history.filter((r) => r.id !== id),
    }));
  },
}));

// ============================================================================
// Hook — auto-fetches on mount
// ============================================================================

export function useAuditHistory() {
  const {
    history,
    isLoading,
    error,
    fetchHistory,
    prependResult,
    removeResult,
  } = useAuditHistoryStore(
    useShallow((state) => ({
      history: state.history,
      isLoading: state.isLoading,
      error: state.error,
      fetchHistory: state.fetchHistory,
      prependResult: state.prependResult,
      removeResult: state.removeResult,
    }))
  );

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, error, prependResult, removeResult };
}
