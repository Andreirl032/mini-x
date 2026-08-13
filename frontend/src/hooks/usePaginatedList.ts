import { useCallback, useEffect, useRef, useState } from "react";

interface PagePayload<T> {
  data: { posts?: T[]; followers?: T[]; following?: T[] };
  meta?: { nextCursor?: string | null };
}

interface UsePaginatedListResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  loadMore: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  sentinelRef: (node: HTMLElement | null) => void;
}

export function usePaginatedList<T extends { id: string }>(
  fetcher: (cursor?: string) => Promise<PagePayload<T>>,
  deps: unknown[] = [],
): UsePaginatedListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);
  const cursorRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const extract = (payload: PagePayload<T>) => {
    const list =
      payload.data.posts ??
      payload.data.followers ??
      payload.data.following ??
      [];
    return {
      list,
      nextCursor: payload.meta?.nextCursor ?? null,
    };
  };

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    setItems([]);
    setCursor(null);
    cursorRef.current = null;
    try {
      const payload = await fetcher(undefined);
      if (id !== requestId.current) return;
      const { list, nextCursor } = extract(payload);
      setItems(list);
      setCursor(nextCursor);
      cursorRef.current = nextCursor;
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load.");
      setItems([]);
      setCursor(null);
      cursorRef.current = null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const currentCursor = cursorRef.current;
    try {
      const payload = await fetcher(currentCursor);
      const { list, nextCursor } = extract(payload);
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...list.filter((item) => !seen.has(item.id))];
      });
      setCursor(nextCursor);
      cursorRef.current = nextCursor;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            void loadMore();
          }
        },
        { root: null, rootMargin: "240px", threshold: 0 },
      );
      observerRef.current.observe(node);
    },
    [loadMore],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(cursor),
    reload,
    loadMore,
    setItems,
    sentinelRef,
  };
}
