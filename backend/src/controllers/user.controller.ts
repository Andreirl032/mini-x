import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  createUserDb,
  editUserDb,
  viewUserDb,
  viewUserPostsDb,
  viewUserLikesDb,
  viewFollowersDb,
  viewFollowingDb,
  followDb,
  unfollowDb,
  deleteUserDb,
  CreateUserData,
  EditUserData,
  viewUserRepliesDb,
} from "../services/user.service";
import { uploadImageToSupabase } from "../services/storage.service";
import { apiSuccess } from "../utils/apiResponse";

const POSTS_PAGE_SIZE = 10;
const FOLLOW_PAGE_SIZE = 20;

export async function createUser(req: Request, res: Response) {
  const userData: CreateUserData = req.body;
  const user = await createUserDb(userData);
  return res.status(201).json(apiSuccess({ user }));
}

export async function editUser(req: Request, res: Response) {
  const userData: EditUserData = req.body;
  const userId = req.params.id as string;
  const user = await editUserDb(userId, userData);
  return res.json(apiSuccess({ user }));
}

export async function viewUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user?.user_id;
  const { user, isFollowing } = await viewUserDb(userId, selfId);
  return res.json(apiSuccess({ user, isFollowing }));
}

export async function viewUserPosts(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user?.user_id;
  const cursor = req.query.cursor as string | undefined;
  const { posts, nextCursor } = await viewUserPostsDb(
    userId,
    POSTS_PAGE_SIZE,
    selfId,
    cursor,
  );
  return res.json(apiSuccess({ posts }, { nextCursor }));
}

export async function viewUserReplies(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query.cursor as string | undefined;
  const { posts, nextCursor } = await viewUserRepliesDb(
    userId,
    POSTS_PAGE_SIZE,
    cursor,
  );
  return res.json(apiSuccess({ posts }, { nextCursor }));
}

export async function viewUserLikes(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query.cursor as string | undefined;
  const { posts, nextCursor } = await viewUserLikesDb(
    userId,
    POSTS_PAGE_SIZE,
    cursor,
  );
  return res.json(apiSuccess({ posts }, { nextCursor }));
}

export async function viewFollowers(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query.cursor as string | undefined;
  const { followers, nextCursor } = await viewFollowersDb(
    userId,
    FOLLOW_PAGE_SIZE,
    cursor,
  );
  return res.json(apiSuccess({ followers }, { nextCursor }));
}

export async function viewFollowing(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query.cursor as string | undefined;
  const { following, nextCursor } = await viewFollowingDb(
    userId,
    FOLLOW_PAGE_SIZE,
    cursor,
  );
  return res.json(apiSuccess({ following }, { nextCursor }));
}

export async function follow(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user!.user_id;
  await followDb(userId, selfId);
  return res.json(apiSuccess(null));
}

export async function unfollow(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user!.user_id;
  await unfollowDb(userId, selfId);
  return res.json(apiSuccess(null));
}

export async function deleteUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  await deleteUserDb(userId);
  return res.json(apiSuccess(null));
}

export async function uploadProfilePicture(req: Request, res: Response) {
  const userId = req.user!.user_id;

  if (!req.file) {
    throw new AppError("No image file provided", 400);
  }

  const fileExtension = req.file.mimetype.split("/")[1];
  const fileName = `${userId}-avatar.${fileExtension}`;

  const imageUrl = await uploadImageToSupabase(
    req.file.buffer,
    fileName,
    req.file.mimetype,
    "avatars",
  );

  const updatedUser = await editUserDb(userId, { profilePicture: imageUrl });

  return res.json(
    apiSuccess(
      { user: updatedUser },
      { message: "Profile picture updated successfully" },
    ),
  );
}
