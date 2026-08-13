import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { TextArea, TextInput } from "@/components/ui/TextField";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Logo } from "@/components/ui/Logo";
import { registerUser } from "@/api/users.api";
import { getErrorMessage } from "@/api/client";
import { registerSchema, type RegisterValues } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth.store";

export function RegisterPage() {
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      city: "",
      countryCode: "",
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    try {
      await registerUser(values);
      await login(values.username, values.password);
      navigate("/");
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not create account."));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
      <div className="w-full rounded-3xl border border-line bg-surface p-8 shadow-sm">
        <Logo to={undefined} />
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-normal">
          Create account
        </h1>
        <p className="mt-2 text-muted">Fill in your details to start posting.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <TextInput
            label="Username"
            error={errors.username?.message}
            {...register("username")}
          />
          <TextInput
            label="Name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextInput
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextInput
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <TextInput
            label="Confirm password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <TextArea
            label="Bio (optional)"
            error={errors.bio?.message}
            {...register("bio")}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput
              label="City"
              error={errors.city?.message}
              {...register("city")}
            />
            <CountrySelect
              label="Country"
              error={errors.countryCode?.message}
              {...register("countryCode")}
            />
          </div>

          {serverError ? <ErrorBanner message={serverError} /> : null}

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-accent hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
