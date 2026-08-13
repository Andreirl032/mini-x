import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Modal } from "@/components/ui/Modal";
import { ComposePost } from "@/components/posts/ComposePost";
import { deletePost, likePost, unlikePost } from "@/api/posts.api";
import { getErrorMessage } from "@/api/client";
import {
  formatEditedAt,
  formatRelativeTime,
  wasPostEdited,
  cn,
} from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import type { Post } from "@/types/api";

interface PostCardProps {
  post: Post;
  onDeleted?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onReplySuccess?: () => void;
  compact?: boolean;
  disableNavigation?: boolean;
}

function StopNav({ children }: { children: ReactNode }) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function PostCard({
  post,
  onDeleted,
  onEdit,
  onReplySuccess,
  compact,
  disableNavigation,
}: PostCardProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const bumpFeed = useUiStore((state) => state.bumpFeed);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [likeAnim, setLikeAnim] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = Boolean(currentUser && post.user_id === currentUser.id);
  const authorName = post.user?.name ?? "Deleted account";
  const authorUsername = post.user?.username ?? "unknown";
  const edited = wasPostEdited(post.created_at, post.updated_at);

  function goToPost() {
    if (disableNavigation) return;
    navigate(`/posts/${post.id}`);
  }

  function goToProfile(event: MouseEvent) {
    event.stopPropagation();
    if (post.user_id) navigate(`/users/${post.user_id}`);
  }

  async function toggleLike(event: MouseEvent) {
    event.stopPropagation();
    if (!currentUser || busy) return;
    setBusy(true);
    setError(null);
    const next = !liked;
    setLiked(next);
    setLikeCount((count) => count + (next ? 1 : -1));
    if (next) {
      setLikeAnim(true);
      window.setTimeout(() => setLikeAnim(false), 420);
    }

    try {
      if (next) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      if (next && message.toLowerCase().includes("already")) {
        setLiked(true);
      } else if (!next && message.toLowerCase().includes("not found")) {
        setLiked(false);
      } else {
        setLiked(!next);
        setLikeCount((count) => count + (next ? -1 : 1));
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!isOwner || busy) return;
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;
    setBusy(true);
    try {
      await deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  }

  return (
    <>
      <article
        role={disableNavigation ? undefined : "link"}
        tabIndex={disableNavigation ? undefined : 0}
        onClick={goToPost}
        onKeyDown={(event) => {
          if (disableNavigation) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToPost();
          }
        }}
        className={cn(
          "feed-divider relative px-4 py-4 transition",
          !disableNavigation && "cursor-pointer hover:bg-paper/70",
          compact && "py-3",
        )}
      >
        <div className="flex gap-3">
          <StopNav>
            <button
              type="button"
              onClick={goToProfile}
              className="shrink-0 cursor-pointer"
            >
              <Avatar
                name={authorName}
                src={post.user?.profile_picture}
                size={compact ? "sm" : "md"}
              />
            </button>
          </StopNav>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <StopNav>
                    <button
                      type="button"
                      onClick={goToProfile}
                      className="cursor-pointer truncate font-bold hover:underline"
                    >
                      {authorName}
                    </button>
                  </StopNav>
                  <span className="truncate text-sm text-muted">
                    @{authorUsername}
                  </span>
                  <span className="text-sm text-muted">·</span>
                  <time
                    className="text-sm text-muted"
                    dateTime={post.created_at}
                    title={new Date(post.created_at).toLocaleString("en-US")}
                  >
                    {formatRelativeTime(post.created_at)}
                  </time>
                  {edited ? (
                    <span
                      className="text-sm text-muted"
                      title={`Edited ${formatEditedAt(post.updated_at)}`}
                    >
                      · Edited {formatEditedAt(post.updated_at)}
                    </span>
                  ) : null}
                </div>
              </div>

              {isOwner ? (
                <StopNav>
                  <div className="relative">
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl p-1.5 text-muted hover:bg-paper hover:text-ink"
                      onClick={() => setMenuOpen((open) => !open)}
                      aria-label="Post options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen ? (
                      <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-paper"
                          onClick={() => {
                            setMenuOpen(false);
                            onEdit?.(post);
                          }}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                          onClick={() => void handleDelete()}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </StopNav>
              ) : null}
            </div>

            {post.body ? (
              <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {post.body}
              </p>
            ) : null}
            {post.image ? (
              <StopNav>
                <button
                  type="button"
                  className="mt-3 block w-full cursor-pointer overflow-hidden rounded-2xl border border-line"
                  onClick={() => setLightbox(true)}
                >
                  <img
                    src={post.image}
                    alt="Post attachment"
                    className="max-h-96 w-full object-cover"
                  />
                </button>
              </StopNav>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "cursor-pointer rounded-xl px-2",
                  liked && "text-danger hover:text-danger",
                  !currentUser && "cursor-pointer opacity-60",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!currentUser) {
                    navigate("/login");
                    return;
                  }
                  void toggleLike(event);
                }}
              >
                <Heart
                  size={16}
                  fill={liked ? "currentColor" : "none"}
                  className={cn(likeAnim && "like-pop")}
                />
                {likeCount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer rounded-xl px-2"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!currentUser) {
                    navigate("/login");
                    return;
                  }
                  setReplyOpen(true);
                }}
              >
                <MessageCircle size={16} />
                {post._count.replies}
              </Button>
            </div>

            {error ? (
              <p className="mt-2 text-xs text-danger">{error}</p>
            ) : null}
          </div>
        </div>
      </article>

      <Modal
        open={replyOpen}
        title="Reply"
        onClose={() => setReplyOpen(false)}
      >
        <ComposePost
          bordered={false}
          parentId={post.id}
          replyingTo={post}
          showReplyPreview
          autoFocus
          placeholder="Post your reply"
          onCancel={() => setReplyOpen(false)}
          onSuccess={() => {
            setReplyOpen(false);
            bumpFeed();
            onReplySuccess?.();
          }}
        />
      </Modal>

      <ImageLightbox
        src={lightbox ? post.image : null}
        onClose={() => setLightbox(false)}
      />
    </>
  );
}
