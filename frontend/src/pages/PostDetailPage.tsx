import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ComposePost } from "@/components/posts/ComposePost";
import { PostCard } from "@/components/posts/PostCard";
import { PostFeed } from "@/components/posts/PostFeed";
import { Modal } from "@/components/ui/Modal";
import {
  ErrorBanner,
  PageHeader,
  Spinner,
} from "@/components/ui/Feedback";
import { fetchPost, fetchPostReplies } from "@/api/posts.api";
import { getErrorMessage } from "@/api/client";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAuthStore } from "@/stores/auth.store";
import type { Post } from "@/types/api";

export function PostDetailPage() {
  const { postId = "" } = useParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [post, setPost] = useState<Post | null>(null);
  const [ancestors, setAncestors] = useState<Post[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [replyKey, setReplyKey] = useState(0);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    setLoadingPost(true);
    setPostError(null);
    try {
      const data = await fetchPost(postId);
      setPost(data.post);
      setAncestors(data.ancestors ?? []);
    } catch (err) {
      setPost(null);
      setAncestors([]);
      setPostError(getErrorMessage(err, "Post not found."));
    } finally {
      setLoadingPost(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const repliesFetcher = useCallback(
    async (cursor?: string) => {
      try {
        return await fetchPostReplies(postId, cursor);
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [postId],
  );

  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    reload,
    setItems,
    sentinelRef,
  } = usePaginatedList<Post>(repliesFetcher, [postId]);

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title="Post" onBack={() => window.history.back()} />

      {loadingPost ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : postError ? (
        <div className="p-4">
          <ErrorBanner message={postError} />
        </div>
      ) : post ? (
        <>
          {ancestors.length > 0 ? (
            <div className="border-b border-line bg-paper/40">
              {ancestors.map((ancestor) => (
                <PostCard
                  key={ancestor.id}
                  post={ancestor}
                  compact
                  onEdit={setEditing}
                  onReplySuccess={() => {
                    void reload();
                    void loadPost();
                  }}
                />
              ))}
            </div>
          ) : null}

          <PostCard
            post={post}
            disableNavigation
            onDeleted={() => window.history.back()}
            onEdit={setEditing}
            onReplySuccess={() => {
              void reload();
              void loadPost();
            }}
          />

          {isAuthenticated ? (
            <ComposePost
              key={replyKey}
              parentId={post.id}
              placeholder="Post your reply"
              onSuccess={() => {
                setReplyKey((value) => value + 1);
                void reload();
                void loadPost();
              }}
            />
          ) : (
            <p className="border-b border-line px-4 py-4 text-sm text-muted">
              <Link
                to="/login"
                className="font-semibold text-accent hover:underline"
              >
                Log in
              </Link>{" "}
              to reply to this post.
            </p>
          )}

          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-lg font-semibold tracking-normal">
              Replies
            </h2>
          </div>

          <PostFeed
            posts={items}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            hasMore={hasMore}
            emptyTitle="No replies yet"
            emptyDescription="Be the first to reply."
            sentinelRef={sentinelRef}
            onRetry={() => void reload()}
            onDeleted={(id) => {
              setItems((prev) => prev.filter((item) => item.id !== id));
              void loadPost();
            }}
            onEdit={setEditing}
            onReplySuccess={() => {
              void reload();
              void loadPost();
            }}
          />
        </>
      ) : null}

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
              void loadPost();
              void reload();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
