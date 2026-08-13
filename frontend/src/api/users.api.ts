import { api } from "@/api/client";
import type {
  ApiSuccess,
  CreatedUser,
  PaginatedPosts,
  UserPublic,
  UserSummary,
} from "@/types/api";
import type { EditProfileValues, RegisterValues } from "@/schemas/auth.schema";

export async function registerUser(values: RegisterValues) {
  const payload = {
    username: values.username,
    name: values.name,
    email: values.email,
    password: values.password,
    bio: values.bio || undefined,
    city: values.city || undefined,
    countryCode: values.countryCode
      ? values.countryCode.toUpperCase()
      : undefined,
  };

  const { data } = await api.post<ApiSuccess<{ user: CreatedUser }>>(
    "/users",
    payload,
  );
  return data.data.user;
}

export async function fetchUser(userId: string) {
  const { data } = await api.get<
    ApiSuccess<{ user: UserPublic; isFollowing: boolean }>
  >(`/users/${userId}`);
  return data.data;
}

export async function fetchUserPosts(userId: string, cursor?: string) {
  const { data } = await api.get<ApiSuccess<PaginatedPosts>>(
    `/users/${userId}/posts`,
    { params: cursor ? { cursor } : undefined },
  );
  return data;
}

export async function fetchUserReplies(userId: string, cursor?: string) {
  const { data } = await api.get<ApiSuccess<PaginatedPosts>>(
    `/users/${userId}/replies`,
    { params: cursor ? { cursor } : undefined },
  );
  return data;
}

export async function fetchUserLikes(userId: string, cursor?: string) {
  const { data } = await api.get<ApiSuccess<PaginatedPosts>>(
    `/users/${userId}/likes`,
    { params: cursor ? { cursor } : undefined },
  );
  return data;
}

export async function fetchFollowers(userId: string, cursor?: string) {
  const { data } = await api.get<
    ApiSuccess<{ followers: UserSummary[] }>
  >(`/users/${userId}/followers`, {
    params: cursor ? { cursor } : undefined,
  });
  return data;
}

export async function fetchFollowing(userId: string, cursor?: string) {
  const { data } = await api.get<
    ApiSuccess<{ following: UserSummary[] }>
  >(`/users/${userId}/following`, {
    params: cursor ? { cursor } : undefined,
  });
  return data;
}

export async function followUser(userId: string) {
  await api.post<ApiSuccess<null>>(`/users/${userId}/follow`);
}

export async function unfollowUser(userId: string) {
  await api.delete<ApiSuccess<null>>(`/users/${userId}/follow`);
}

export async function editUser(userId: string, values: EditProfileValues) {
  const payload = {
    username: values.username,
    name: values.name,
    bio: values.bio || undefined,
    city: values.city || undefined,
    countryCode: values.countryCode
      ? values.countryCode.toUpperCase()
      : undefined,
  };

  const { data } = await api.patch<ApiSuccess<{ user: CreatedUser }>>(
    `/users/${userId}`,
    payload,
  );
  return data.data.user;
}

export async function uploadAvatar(userId: string, image: File) {
  const form = new FormData();
  form.append("image", image);

  const { data } = await api.patch<ApiSuccess<{ user: CreatedUser }>>(
    `/users/${userId}/avatar`,
    form,
  );
  return data.data.user;
}

export async function deleteAccount(userId: string) {
  await api.delete<ApiSuccess<null>>(`/users/${userId}`);
}
