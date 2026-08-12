import { Request, Response } from "express";
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

export async function createUser(req: Request, res: Response) {
  const userData: CreateUserData = req.body;
  const user = await createUserDb(userData);
  return res.status(201).json({ user: user });
}

export async function editUser(req: Request, res: Response) {
  const userData: EditUserData = req.body;
  const userId = req.params.id as string;
  const user = await editUserDb(userId, userData);
  return res.status(200).json({ user: user });
}

export async function viewUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user?.user_id;
  const { user, isFollowing } = await viewUserDb(userId, selfId);
  return res.status(200).json({ user: user, isFollowing: isFollowing });
}

export async function viewUserPosts(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user?.user_id;
  const cursor = req.query?.cursor as string | undefined;
  const take = 10;
  const { posts, nextCursor } = await viewUserPostsDb(
    userId,
    take,
    selfId,
    cursor,
  );
  return res.status(200).json({ posts: posts, nextCursor: nextCursor });
}

export async function viewUserReplies(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query?.cursor as string | undefined;
  const take = 10;
  const { posts, nextCursor } = await viewUserRepliesDb(userId, take, cursor);
  return res.status(200).json({ posts: posts, nextCursor: nextCursor });
}

export async function viewUserLikes(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query?.cursor as string | undefined;
  const take = 10;
  const { posts, nextCursor } = await viewUserLikesDb(userId, take, cursor);
  return res.status(200).json({ posts: posts, nextCursor: nextCursor });
}

export async function viewFollowers(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query?.cursor as string | undefined;
  const take = 20;
  const { followers, nextCursor } = await viewFollowersDb(userId, take, cursor);
  return res.status(200).json({ followers: followers, nextCursor: nextCursor });
}

export async function viewFollowing(req: Request, res: Response) {
  const userId = req.params.id as string;
  const cursor = req.query?.cursor as string | undefined;
  const take = 20;
  const { following, nextCursor } = await viewFollowingDb(userId, take, cursor);
  return res.status(200).json({ following: following, nextCursor: nextCursor });
}

export async function follow(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user?.user_id;
  await followDb(userId, selfId);
  return res.sendStatus(200);
}

export async function unfollow(req: Request, res: Response) {
  const userId = req.params.id as string;
  const selfId = req.user?.user_id;
  await unfollowDb(userId, selfId);
  return res.sendStatus(200);
}

export async function deleteUser(req: Request, res: Response) {
  const userId = req.params.id as string;
  await deleteUserDb(userId);
  return res.sendStatus(200);
}

export async function uploadProfilePicture(req: Request, res: Response) {
  const userId = req.user?.user_id;

  // Verifica se o middleware do multer realmente pegou o arquivo
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  // Cria um nome único para a imagem (ex: 12345-avatar.jpg)
  const fileExtension = req.file.mimetype.split("/")[1];
  const fileName = `${userId}-avatar.${fileExtension}`;

  // Faz o upload pro Supabase
  const imageUrl = await uploadImageToSupabase(
    req.file.buffer,
    fileName,
    req.file.mimetype,
    "avatars",
  );

  // Atualiza o banco de dados (reaproveitando sua função editUserDb)
  const updatedUser = await editUserDb(userId, { profilePicture: imageUrl });

  return res.status(200).json({
    message: "Profile picture updated successfully",
    user: updatedUser,
  });
}
