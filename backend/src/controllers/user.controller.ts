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
} from "../services/user.service";

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
  // Lógica para listar os posts de um usuário específico
}

export async function viewUserLikes(req: Request, res: Response) {
  // Lógica para listar as curtidas de um usuário específico
}

export async function viewFollowers(req: Request, res: Response) {
  // Lógica para listar quem segue este usuário
}

export async function viewFollowing(req: Request, res: Response) {
  // Lógica para listar quem este usuário está seguindo
}

export async function follow(req: Request, res: Response) {
  // Lógica para começar a seguir um usuário
}

export async function unfollow(req: Request, res: Response) {
  // Lógica para deixar de seguir um usuário
}

export async function deleteUser(req: Request, res: Response) {
  // Lógica para deletar a conta
}
