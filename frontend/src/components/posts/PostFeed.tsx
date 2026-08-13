import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorBanner,
  Spinner,
} from "@/components/ui/Feedback";
import type { Post } from "@/types/api";

interface PostFeedProps {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  sentinelRef: (node: HTMLElement | null) => void;
  onDeleted: (postId: string) => void;
  onEdit: (post: Post) => void;
  onReplySuccess?: () => void;
  onRetry?: () => void;
}

export function PostFeed({
  posts,
  loading,
  loadingMore,
  error,
  hasMore,
  emptyTitle,
  emptyDescription,
  sentinelRef,
  onDeleted,
  onEdit,
  onReplySuccess,
  onRetry,
}: PostFeedProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <ErrorBanner message={error} />
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (posts.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={onDeleted}
          onEdit={onEdit}
          onReplySuccess={onReplySuccess}
        />
      ))}

      {error ? (
        <div className="p-4">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      <div ref={sentinelRef} className="h-8 w-full" aria-hidden />

      {loadingMore ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : null}

      {!hasMore && !loadingMore ? (
        <p className="py-8 text-center text-sm text-muted">End of feed</p>
      ) : null}
    </div>
  );
}
