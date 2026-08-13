import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/Feedback";
import { createPost, editPost } from "@/api/posts.api";
import { getErrorMessage } from "@/api/client";
import {
  composePostSchema,
  type ComposePostValues,
} from "@/schemas/post.schema";
import { formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import type { Post } from "@/types/api";

interface ComposePostProps {
  parentId?: string;
  replyingTo?: Post | null;
  showReplyPreview?: boolean;
  editing?: Post | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  bordered?: boolean;
}

export function ComposePost({
  parentId,
  replyingTo,
  showReplyPreview = false,
  editing,
  onSuccess,
  onCancel,
  placeholder = "What's happening?",
  autoFocus,
  bordered = true,
}: ComposePostProps) {
  const user = useAuthStore((state) => state.user);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ComposePostValues>({
    resolver: zodResolver(composePostSchema),
    defaultValues: {
      body: editing?.body ?? "",
    },
  });

  const body = watch("body") ?? "";

  function onPickImage(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setImage(null);
      setPreview(null);
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: ComposePostValues) {
    setServerError(null);
    const trimmed = values.body?.trim() ?? "";

    if (!trimmed && !image && !editing?.image) {
      setServerError("Write something or attach an image.");
      return;
    }

    try {
      if (editing) {
        await editPost(editing.id, {
          body: trimmed || undefined,
          image,
        });
      } else {
        await createPost({
          body: trimmed || undefined,
          parentId,
          image,
        });
      }
      reset({ body: "" });
      onPickImage(null);
      onSuccess?.();
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  if (!user) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={bordered ? "border-b border-line px-4 py-4" : "py-1"}
    >
      {replyingTo && showReplyPreview ? (
        <div className="mb-4 rounded-2xl border border-line bg-paper/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Replying to @{replyingTo.user?.username ?? "unknown"}
          </p>
          <div className="mt-2 flex gap-3">
            <Avatar
              name={replyingTo.user?.name ?? "User"}
              src={replyingTo.user?.profile_picture}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 text-sm">
                <span className="font-bold">
                  {replyingTo.user?.name ?? "Deleted account"}
                </span>
                <span className="text-muted">
                  @{replyingTo.user?.username ?? "unknown"}
                </span>
                <span className="text-muted">
                  · {formatRelativeTime(replyingTo.created_at)}
                </span>
              </div>
              {replyingTo.body ? (
                <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-ink-soft">
                  {replyingTo.body}
                </p>
              ) : null}
              {replyingTo.image ? (
                <img
                  src={replyingTo.image}
                  alt=""
                  className="mt-2 max-h-32 rounded-xl object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex gap-3">
        <Avatar name={user.name} src={user.profile_picture} />
        <div className="min-w-0 flex-1">
          <textarea
            {...register("body")}
            autoFocus={autoFocus}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none border-0 bg-transparent text-lg outline-none placeholder:text-muted"
          />

          {preview ? (
            <div className="relative mt-3">
              <img
                src={preview}
                alt="Preview"
                className="max-h-72 w-full rounded-2xl object-cover"
              />
              <button
                type="button"
                className="absolute right-3 top-3 rounded-full bg-ink/70 p-1.5 text-white"
                onClick={() => onPickImage(null)}
              >
                <X size={16} />
              </button>
            </div>
          ) : null}

          {serverError ? (
            <div className="mt-3">
              <ErrorBanner message={serverError} />
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-accent hover:bg-accent-soft">
                <ImagePlus size={18} />
                <span className="text-sm font-semibold">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    onPickImage(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <span className="text-xs text-muted">{body.length}/500</span>
            </div>

            <div className="flex items-center gap-2">
              {onCancel ? (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={isSubmitting}>
                {editing ? "Save" : parentId ? "Reply" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
