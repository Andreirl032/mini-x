import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextField";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Logo } from "@/components/ui/Logo";
import { getErrorMessage } from "@/api/client";
import { loginSchema, type LoginValues } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth.store";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await login(values.username, values.password);
      navigate("/");
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not log in."));
    }
  }

  return (
    <div className="flex min-h-screen w-full items-stretch">
      <section className="relative hidden min-h-screen w-1/2 overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#0f8f86_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#1a2438_0%,transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14 text-white">
          <Logo to={undefined} inverted />
          <div>
            <h1 className="font-display max-w-lg text-4xl font-semibold leading-tight tracking-normal xl:text-5xl">
              Conversations in motion.
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/70">
              Post, follow, and reply in a clean social feed — inspired by X,
              with its own identity.
            </p>
          </div>
          <p className="text-sm text-white/50">
            Built to learn real backend + frontend.
          </p>
        </div>
      </section>

      <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo to={undefined} />
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-normal">
            Log in
          </h2>
          <p className="mt-2 text-muted">
            Use your username and password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <TextInput
              label="Username"
              autoComplete="username"
              error={errors.username?.message}
              {...register("username")}
            />
            <TextInput
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {serverError ? <ErrorBanner message={serverError} /> : null}

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
