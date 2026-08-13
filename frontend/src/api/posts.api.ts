import { api } from "@/api/client";
import type { ApiSuccess, PaginatedPosts, Post } from "@/types/api";

export async function fetchGlobalFeed(cursor?: string) {
  const { data } = await api.get<ApiSuccess<PaginatedPosts>>("/posts", {
    params: cursor ? { cursor } : undefined,
  });
  return data;
}

export async function fetchFollowingFeed(cursor?: string) {
  const { data } = await api.get<ApiSuccess<PaginatedPosts>>("/posts/feedFollowing", {
    params: cursor ? { cursor } : undefined,
  });
  return data;
}

export async function fetchPost(postId: string) {
  const { data } = await api.get<
    ApiSuccess<{ post: Post; ancestors: Post[] }>
  >(`/posts/${postId}`);
  return data.data;
}

export async function fetchPostReplies(postId: string, cursor?: string) {
  const { data } = await api.get<ApiSuccess<PaginatedPosts>>(
    `/posts/${postId}/replies`,
    { params: cursor ? { cursor } : undefined },
  );
  return data;
}

export async function createPost(input: {
  body?: string;
  parentId?: string;
  image?: File | null;
}) {
  const form = new FormData();
  if (input.body?.trim()) form.append("body", input.body.trim());
  if (input.parentId) form.append("parentId", input.parentId);
  if (input.image) form.append("image", input.image);

  const { data } = await api.post<ApiSuccess<null>>("/posts", form);
  return data;
}

export async function editPost(
  postId: string,
  input: { body?: string; image?: File | null },
) {
  const form = new FormData();
  if (input.body !== undefined) form.append("body", input.body);
  if (input.image) form.append("image", input.image);

  const { data } = await api.patch<ApiSuccess<null>>(`/posts/${postId}`, form);
  return data;
}

export async function deletePost(postId: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/posts/${postId}`);
  return data;
}

export async function likePost(postId: string) {
  const { data } = await api.post<ApiSuccess<{ like: unknown }>>(
    `/posts/${postId}/likes`,
  );
  return data;
}

export async function unlikePost(postId: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/posts/${postId}/likes`);
  return data;
}
