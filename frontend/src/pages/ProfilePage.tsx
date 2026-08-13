import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CalendarDays, MapPin, UserMinus, UserPlus } from "lucide-react";
import { ComposePost } from "@/components/posts/ComposePost";
import { PostFeed } from "@/components/posts/PostFeed";
import { FollowListModal } from "@/components/users/FollowListModal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  EmptyState,
  ErrorBanner,
  PageHeader,
  Spinner,
} from "@/components/ui/Feedback";
import {
  fetchUser,
  fetchUserLikes,
  fetchUserPosts,
  fetchUserReplies,
  followUser,
  unfollowUser,
} from "@/api/users.api";
import { getErrorMessage } from "@/api/client";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { countryNameFromCode } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import type { Post, ProfileTab, UserPublic } from "@/types/api";

type ContentTab = Extract<ProfileTab, "posts" | "replies" | "likes">;

const tabs: Array<{ id: ContentTab; label: string; owner?: boolean }> = [
  { id: "posts", label: "Posts" },
  { id: "replies", label: "Replies" },
  { id: "likes", label: "Likes", owner: true },
];

export function ProfilePage() {
  const { id = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(
    null,
  );

  const isOwner = Boolean(currentUser && currentUser.id === id);
  const tabParam = searchParams.get("tab");
  const activeTab: ContentTab =
    tabParam === "replies" || (tabParam === "likes" && isOwner)
      ? tabParam
      : "posts";

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUser(id);
      setProfile(data.user);
      setIsFollowing(data.isFollowing);
    } catch (err) {
      setProfile(null);
      setError(getErrorMessage(err, "User not found."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const postsFetcher = useCallback(
    async (cursor?: string) => {
      try {
        if (activeTab === "replies") return await fetchUserReplies(id, cursor);
        if (activeTab === "likes") return await fetchUserLikes(id, cursor);
        return await fetchUserPosts(id, cursor);
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [activeTab, id],
  );

  const list = usePaginatedList<Post>(postsFetcher, [activeTab, id]);

  async function toggleFollow() {
    if (!currentUser || isOwner || followBusy) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  followers: Math.max(0, prev._count.followers - 1),
                },
              }
            : prev,
        );
      } else {
        await followUser(id);
        setIsFollowing(true);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  followers: prev._count.followers + 1,
                },
              }
            : prev,
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFollowBusy(false);
    }
  }

  const visibleTabs = tabs.filter((tab) => !tab.owner || isOwner);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-4 p-4">
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!profile) {
    return <EmptyState title="User not found" />;
  }

  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const countryName = countryNameFromCode(profile.country_code);

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title={profile.name} subtitle={`@${profile.username}`} />

      <section className="border-b border-line px-4 pb-5 pt-4">
        <div className="flex items-start justify-between gap-4">
          <Avatar
            name={profile.name}
            src={profile.profile_picture}
            size="xl"
          />
          {isOwner ? (
            <Link to="/settings">
              <Button variant="secondary">Edit profile</Button>
            </Link>
          ) : isAuthenticated ? (
            <Button
              variant={isFollowing ? "soft" : "primary"}
              onClick={() => void toggleFollow()}
              disabled={followBusy}
            >
              {isFollowing ? (
                <>
                  <UserMinus size={16} /> Following
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Follow
                </>
              )}
            </Button>
          ) : (
            <Link to="/login">
              <Button>Log in to follow</Button>
            </Link>
          )}
        </div>

        <h2 className="mt-4 font-display text-2xl font-semibold tracking-normal">
          {profile.name}
        </h2>
        <p className="text-muted">@{profile.username}</p>
        {profile.bio ? (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
            {profile.bio}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {(profile.city || countryName) && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {[profile.city, countryName].filter(Boolean).join(", ")}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} /> Joined {joined}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="cursor-pointer hover:underline"
                onClick={() => setFollowModal("following")}
              >
                <strong className="text-ink">{profile._count.following}</strong>{" "}
                <span className="text-muted">Following</span>
              </button>
              <button
                type="button"
                className="cursor-pointer hover:underline"
                onClick={() => setFollowModal("followers")}
              >
                <strong className="text-ink">{profile._count.followers}</strong>{" "}
                <span className="text-muted">Followers</span>
              </button>
            </>
          ) : (
            <>
              <span>
                <strong className="text-ink">{profile._count.following}</strong>{" "}
                <span className="text-muted">Following</span>
              </span>
              <span>
                <strong className="text-ink">{profile._count.followers}</strong>{" "}
                <span className="text-muted">Followers</span>
              </span>
            </>
          )}
          <span>
            <strong className="text-ink">{profile._count.posts}</strong>{" "}
            <span className="text-muted">Posts</span>
          </span>
        </div>
      </section>

      <div className="flex overflow-x-auto border-b border-line">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSearchParams({ tab: tab.id })}
            className={cn(
              "relative min-w-28 flex-1 cursor-pointer px-4 py-3 text-sm font-semibold text-muted transition hover:bg-paper",
              activeTab === tab.id && "text-ink",
            )}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-6 bottom-0 h-1 rounded-full bg-accent" />
            ) : null}
          </button>
        ))}
      </div>

      <PostFeed
        key={`${id}-${activeTab}`}
        posts={list.items}
        loading={list.loading}
        loadingMore={list.loadingMore}
        error={list.error}
        hasMore={list.hasMore}
        emptyTitle="Nothing here yet"
        emptyDescription="When there is content, it will show up in this tab."
        sentinelRef={list.sentinelRef}
        onRetry={() => void list.reload()}
        onDeleted={(postId) =>
          list.setItems((prev) => prev.filter((item) => item.id !== postId))
        }
        onEdit={setEditing}
        onReplySuccess={() => void list.reload()}
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
              void list.reload();
            }}
          />
        ) : null}
      </Modal>

      <FollowListModal
        open={Boolean(followModal)}
        userId={id}
        mode={followModal}
        onClose={() => setFollowModal(null)}
      />

      {error && profile ? (
        <div className="p-4">
          <ErrorBanner message={error} />
        </div>
      ) : null}
    </div>
  );
}
