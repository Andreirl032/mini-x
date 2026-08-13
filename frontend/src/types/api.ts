export interface ApiSuccess<T> {
  data: T;
  meta?: {
    nextCursor?: string | null;
    message?: string;
  };
}

export interface ApiErrorBody {
  error: {
    message: string;
    details?: string[];
  };
}

export interface JwtPayload {
  user_id: string;
  iat?: number;
  exp?: number;
}

export interface UserPublic {
  username: string;
  name: string;
  bio: string | null;
  profile_picture: string | null;
  birth_date: string | null;
  city: string | null;
  country_code: string | null;
  created_at: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface PostAuthor {
  username: string;
  name: string;
  profile_picture: string | null;
}

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  profile_picture: string | null;
  bio?: string | null;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  bio: string | null;
  profile_picture: string | null;
  city: string | null;
  country_code: string | null;
}

export interface CreatedUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  profile_picture: string | null;
  bio: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string | null;
  parent_id: string | null;
  body: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user: PostAuthor | null;
  _count: {
    likes: number;
    replies: number;
  };
}

export interface PaginatedPosts {
  posts: Post[];
}

export interface PaginatedUsers {
  followers?: UserSummary[];
  following?: UserSummary[];
}

export type ProfileTab = "posts" | "replies" | "likes" | "followers" | "following";
