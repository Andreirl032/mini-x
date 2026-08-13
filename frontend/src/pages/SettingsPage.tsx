import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { TextArea, TextInput } from "@/components/ui/TextField";
import { ErrorBanner, PageHeader } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import {
  deleteAccount,
  editUser,
  uploadAvatar,
} from "@/api/users.api";
import { getErrorMessage } from "@/api/client";
import {
  editProfileSchema,
  type EditProfileValues,
} from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth.store";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    values: {
      username: user?.username ?? "",
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      city: user?.city ?? "",
      countryCode: user?.country_code ?? "",
    },
  });

  if (!user) return null;

  const userId = user.id;

  async function onSubmit(values: EditProfileValues) {
    setServerError(null);
    setSuccess(null);
    try {
      await editUser(userId, values);
      await refreshProfile();
      setSuccess("Profile updated.");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  async function onAvatarChange(file: File | null) {
    if (!file) return;
    setAvatarBusy(true);
    setServerError(null);
    setSuccess(null);
    try {
      await uploadAvatar(userId, file);
      await refreshProfile();
      setSuccess("Profile picture updated.");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure? This deletes your account and cannot be undone.",
    );
    if (!confirmed) return;
    setDeleteBusy(true);
    try {
      await deleteAccount(userId);
      await logout();
      navigate("/register");
    } catch (err) {
      setServerError(getErrorMessage(err));
      setDeleteBusy(false);
    }
  }

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title="Account" subtitle="Manage your profile" />

      <div className="space-y-8 px-4 py-6">
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Profile picture</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Avatar name={user.name} src={user.profile_picture} size="xl" />
            <label className="inline-flex cursor-pointer">
              <span className="rounded-xl bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-deep">
                {avatarBusy ? "Uploading..." : "Change photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarBusy}
                onChange={(event) =>
                  void onAvatarChange(event.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Profile details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
            <TextArea
              label="Bio"
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
            {success ? (
              <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-accent-deep">
                {success}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-danger/20 bg-danger-soft/40 p-5">
          <h2 className="font-display text-lg font-semibold text-danger">
            Danger zone
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Deleting your account removes your profile. Posts with replies may
            remain as soft-deleted.
          </p>
          <Button
            className="mt-4"
            variant="danger"
            disabled={deleteBusy}
            onClick={() => void onDeleteAccount()}
          >
            {deleteBusy ? "Deleting..." : "Delete account"}
          </Button>
        </section>
      </div>
    </div>
  );
}
