import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ComposePost } from "@/components/posts/ComposePost";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Feedback";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

function BootGate({ children }: { children: ReactNode }) {
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  return children;
}

function ShellWithCompose() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const bumpFeed = useUiStore((state) => state.bumpFeed);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeKey, setComposeKey] = useState(0);

  return (
    <>
      <AppShell
        onCompose={
          isAuthenticated ? () => setComposeOpen(true) : undefined
        }
      >
        <Outlet />
      </AppShell>

      {isAuthenticated ? (
        <Modal
          open={composeOpen}
          title="New post"
          onClose={() => setComposeOpen(false)}
        >
          <ComposePost
            key={composeKey}
            autoFocus
            onCancel={() => setComposeOpen(false)}
            onSuccess={() => {
              setComposeOpen(false);
              setComposeKey((value) => value + 1);
              bumpFeed();
            }}
          />
        </Modal>
      ) : null}
    </>
  );
}

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  return (
    <BootGate>
      {!isAuthenticated ? (
        <Navigate to="/login" replace state={{ from: location }} />
      ) : (
        <ShellWithCompose />
      )}
    </BootGate>
  );
}

export function SoftAuthRoute() {
  return (
    <BootGate>
      <ShellWithCompose />
    </BootGate>
  );
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BootGate>
      {isAuthenticated ? <Navigate to="/" replace /> : <Outlet />}
    </BootGate>
  );
}

export function Bootstrapper({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return children;
}
