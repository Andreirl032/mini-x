import {
  Home,
  LogOut,
  PenSquare,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const authLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/following", label: "Following", icon: Users },
  { to: "/settings", label: "Account", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
  onCompose?: () => void;
}

export function AppShell({ children, onCompose }: AppShellProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell relative min-h-screen">
      {/* Fixed to the left edge of the viewport */}
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[100px] flex-col gap-6 border-r border-line bg-paper px-3 py-6 md:flex lg:w-[280px] lg:px-5">
        <div className="px-1 lg:px-2">
          <Logo to={user ? "/" : "/login"} />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {user ? (
            <>
              {authLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  title={label}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-base font-semibold transition lg:justify-start lg:px-4",
                      isActive
                        ? "bg-ink text-white"
                        : "text-ink-soft hover:bg-surface",
                    )
                  }
                >
                  <Icon size={20} />
                  <span className="hidden lg:inline">{label}</span>
                </NavLink>
              ))}
              <NavLink
                to={`/users/${user.id}`}
                title="Profile"
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-base font-semibold transition lg:justify-start lg:px-4",
                    isActive
                      ? "bg-ink text-white"
                      : "text-ink-soft hover:bg-surface",
                  )
                }
              >
                <UserRound size={20} />
                <span className="hidden lg:inline">Profile</span>
              </NavLink>
            </>
          ) : (
            <div className="space-y-2 px-1">
              <p className="hidden text-sm text-muted lg:block">
                Sign in to post, follow, and like.
              </p>
              <Button fullWidth onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button
                fullWidth
                variant="soft"
                onClick={() => navigate("/register")}
              >
                Sign up
              </Button>
            </div>
          )}
        </nav>

        {user && onCompose ? (
          <Button
            fullWidth
            size="lg"
            onClick={onCompose}
            className="rounded-2xl"
            title="Post"
          >
            <PenSquare size={18} />
            <span className="hidden lg:inline">Post</span>
          </Button>
        ) : null}

        {user ? (
          <div className="rounded-2xl border border-line bg-surface p-2 lg:p-3">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.profile_picture} />
              <div className="hidden min-w-0 flex-1 lg:block">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted">@{user.username}</p>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-xl p-2 text-muted hover:bg-paper hover:text-ink"
                title="Log out"
                onClick={() => void handleLogout()}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      {/*
        Feed is centered on the viewport (mx-auto).
        Below xl, add left padding so it never sits under the fixed sidebar.
        From xl up, true visual center of the screen.
      */}
      <div className="flex min-h-screen justify-center md:pl-[100px] lg:pl-[280px] xl:pl-0">
        <main className="min-h-screen w-full max-w-[720px] border-x border-line bg-surface">
          {children}
        </main>
      </div>

      {user ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface/95 px-2 py-2 backdrop-blur md:hidden">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold",
                isActive ? "text-accent" : "text-muted",
              )
            }
          >
            <Home size={20} />
            Home
          </NavLink>
          <NavLink
            to="/following"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold",
                isActive ? "text-accent" : "text-muted",
              )
            }
          >
            <Users size={20} />
            Following
          </NavLink>
          <button
            type="button"
            onClick={onCompose}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-muted"
          >
            <PenSquare size={20} />
            Post
          </button>
          <NavLink
            to={`/users/${user.id}`}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold",
                isActive ? "text-accent" : "text-muted",
              )
            }
          >
            <UserRound size={20} />
            Profile
          </NavLink>
        </nav>
      ) : null}
    </div>
  );
}
