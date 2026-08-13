import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import type { UserSummary } from "@/types/api";

interface UserListProps {
  users: UserSummary[];
  emptyTitle: string;
}

export function UserList({ users, emptyTitle }: UserListProps) {
  if (users.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-muted">{emptyTitle}</p>
    );
  }

  return (
    <div>
      {users.map((user) => (
        <Link
          key={user.id}
          to={`/users/${user.id}`}
          className="flex cursor-pointer items-center gap-3 border-b border-line px-4 py-4 transition hover:bg-paper/70"
        >
          <Avatar name={user.name} src={user.profile_picture} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{user.name}</p>
            <p className="truncate text-sm text-muted">@{user.username}</p>
            {user.bio ? (
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                {user.bio}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
