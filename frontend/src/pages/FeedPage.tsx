import { useCallback, useState } from "react";
import { ComposePost } from "@/components/posts/ComposePost";
import { PostFeed } from "@/components/posts/PostFeed";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/Feedback";
import { fetchFollowingFeed } from "@/api/posts.api";
import { getErrorMessage } from "@/api/client";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useUiStore } from "@/stores/ui.store";
import type { Post } from "@/types/api";

export function FeedPage() {
  const [editing, setEditing] = useState<Post | null>(null);
  const [composeKey, setComposeKey] = useState(0);
  const feedTick = useUiStore((state) => state.feedTick);

  const fetcher = useCallback(async (cursor?: string) => {
    try {
      return await fetchFollowingFeed(cursor);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    reload,
    setItems,
    sentinelRef,
  } = usePaginatedList<Post>(fetcher, [feedTick]);

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader
        title="Following"
        subtitle="Posts from people you follow and yourself"
      />
      <ComposePost
        key={composeKey}
        onSuccess={() => {
          setComposeKey((value) => value + 1);
          void reload();
        }}
      />
      <PostFeed
        posts={items}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        emptyTitle="Your following feed is quiet"
        emptyDescription="Follow people from Home or publish your first post."
        sentinelRef={sentinelRef}
        onRetry={() => void reload()}
        onDeleted={(postId) =>
          setItems((prev) => prev.filter((post) => post.id !== postId))
        }
        onEdit={setEditing}
        onReplySuccess={() => void reload()}
      />

      <Modal
        open={Boolean(editing)}
        title="Edit post"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <ComposePost
            bordered={false}
            editing={editing}
            onCancel={() => setEditing(null)}
            onSuccess={() => {
              setEditing(null);
              void reload();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
