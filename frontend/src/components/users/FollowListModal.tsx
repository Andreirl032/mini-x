import { useCallback, useEffect, useRef } from "react";
import { UserList } from "@/components/users/UserList";
import { Modal } from "@/components/ui/Modal";
import { ErrorBanner, Spinner } from "@/components/ui/Feedback";
import { fetchFollowers, fetchFollowing } from "@/api/users.api";
import { getErrorMessage } from "@/api/client";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import type { UserSummary } from "@/types/api";

interface FollowListModalProps {
  open: boolean;
  userId: string;
  mode: "followers" | "following" | null;
  onClose: () => void;
}

export function FollowListModal({
  open,
  userId,
  mode,
  onClose,
}: FollowListModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetcher = useCallback(
    async (cursor?: string) => {
      if (!mode || !open) {
        return {
          data: { followers: [] as UserSummary[] },
          meta: { nextCursor: null },
        };
      }
      try {
        return mode === "followers"
          ? await fetchFollowers(userId, cursor)
          : await fetchFollowing(userId, cursor);
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mode, userId, open],
  );

  const { items, loading, loadingMore, error, hasMore, loadMore } =
    usePaginatedList<UserSummary>(fetcher, [mode, userId, open]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !open) return;

    const onScroll = () => {
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 96) {
        void loadMore();
      }
    };

    node.addEventListener("scroll", onScroll);
    return () => node.removeEventListener("scroll", onScroll);
  }, [loadMore, open]);

  if (!mode) return null;

  return (
    <Modal
      open={open}
      title={mode === "followers" ? "Followers" : "Following"}
      onClose={onClose}
    >
      <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <ErrorBanner message={error} />
        ) : (
          <>
            <UserList
              users={items}
              emptyTitle={
                mode === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"
              }
            />
            {loadingMore ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : null}
            {!hasMore && items.length > 0 ? (
              <p className="py-4 text-center text-xs text-muted">End of list</p>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}
