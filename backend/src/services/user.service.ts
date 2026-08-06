import prisma from "../database/prisma";
import { AppError } from "../errors/AppError";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  bio?: string;
  birthDate?: string; // Vem como string do frontend
  city?: string;
  countryCode?: string;
  googleId?: string;
}

export async function createUserDb(data: CreateUserData) {
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (userExists) {
    throw new AppError("Username ou E-mail já estão em uso.", 409); // 409 = Conflict
  }

  const password = !data.password
    ? undefined
    : await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      email: data.email,
      role: "USER",
      password: password,
      profile_picture: data.profilePicture,
      bio: data.bio,
      birth_date: data.birthDate ? new Date(data.birthDate) : undefined,
      city: data.city,
      country_code: data.countryCode,
      google_id: data.googleId,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      profile_picture: true,
      bio: true,
      created_at: true,
    },
  });

  return user;
}

export async function editUserDb(parameters: any) {
  // Lógica de banco para editar usuário
}

export async function viewUserDb(parameters: any) {
  // Lógica de banco para buscar os dados da conta
}

export async function viewUserPostsDb(parameters: any) {
  // Lógica de banco para buscar os posts de um usuário específico
}

export async function viewUserLikesDb(parameters: any) {
  // Lógica de banco para buscar as curtidas de um usuário específico
}

export async function viewFollowersDb(parameters: any) {
  // Lógica de banco para buscar quem segue este usuário
}

export async function viewFollowingDb(parameters: any) {
  // Lógica de banco para buscar quem este usuário está seguindo
}

export async function followDb(parameters: any) {
  // Lógica de banco para criar a relação de seguidor
}

export async function unfollowDb(parameters: any) {
  // Lógica de banco para deletar a relação de seguidor
}

export async function deleteUserDb(parameters: any) {
  // Lógica de banco para deletar a conta
}
