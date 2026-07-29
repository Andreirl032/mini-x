import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client"; // Caminho baseado no seu schema
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function main() {
  console.log("🧹 Limpando o banco de dados...");
  
  // A ordem de deleção importa! 
  // Deletamos primeiro as tabelas filhas para não dar erro de Foreign Key
  await prisma.session.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany(); 
  await prisma.user.deleteMany();

  console.log("🔑 Gerando hash da senha padrão (123456)...");
  const passwordHash = await bcrypt.hash("123456", 10);

  console.log("👤 Criando usuários...");
  
  // 1. Criando a usuária principal (Alice)
  const alice = await prisma.user.create({
    data: {
      username: "alice_wonder",
      name: "Alice Silva",
      email: "alice@email.com",
      password: passwordHash,
      role: "USER",
      bio: "Explorando o país das maravilhas do código.",
      city: "São Paulo",
      country_code: "BR",
    },
  });

  // 2. Criando o Bob
  const bob = await prisma.user.create({
    data: {
      username: "bob_builder",
      name: "Bob Construtor",
      email: "bob@email.com",
      password: passwordHash,
      role: "USER",
      bio: "Podemos consertar? Sim, nós podemos!",
    },
  });

  // 3. Criando o Charlie
  const charlie = await prisma.user.create({
    data: {
      username: "charlie_brown",
      name: "Charlie Brown",
      email: "charlie@email.com",
      password: passwordHash,
      role: "USER",
      bio: "Que puxa...",
    },
  });

  // 4. Criando a Diana
  const diana = await prisma.user.create({
    data: {
      username: "diana_prince",
      name: "Diana Prince",
      email: "diana@email.com",
      password: passwordHash,
      role: "ADMIN", // Simulando uma admin
      bio: "Lutando por justiça.",
    },
  });

  console.log("🤝 Criando seguidores (Follows)...");
  
  await prisma.follow.createMany({
    data: [
      { follower_id: bob.id, followed_id: alice.id },    // Bob segue Alice
      { follower_id: charlie.id, followed_id: alice.id }, // Charlie segue Alice
      { follower_id: alice.id, followed_id: diana.id },   // Alice segue Diana
      { follower_id: bob.id, followed_id: diana.id },     // Bob segue Diana
    ],
  });

  console.log("📝 Criando posts principais...");

  const postAlice1 = await prisma.post.create({
    data: {
      user_id: alice.id,
      body: "Acabei de configurar meu banco PostgreSQL com Prisma! Que maravilha 🚀",
    },
  });

  const postAlice2 = await prisma.post.create({
    data: {
      user_id: alice.id,
      body: "Alguém aí já usou JWT com Refresh Tokens? Tô apanhando um pouco haha",
    },
  });

  const postDiana = await prisma.post.create({
    data: {
      user_id: diana.id,
      body: "Bom dia a todos! Lembrem-se de manter a paz no feed hoje. 🕊️",
    },
  });

  console.log("💬 Criando respostas (Replies)...");

  // Bob responde o Post 1 da Alice
  const replyBob = await prisma.post.create({
    data: {
      user_id: bob.id,
      parent_id: postAlice1.id, // Aqui entra a mágica da auto-relação!
      body: "Aí sim, Alice! Prisma facilita muito a vida.",
    },
  });

  // Charlie responde a resposta do Bob (Uma thread!)
  await prisma.post.create({
    data: {
      user_id: charlie.id,
      parent_id: replyBob.id,
      body: "Verdade, eu usava TypeORM antes e a diferença é brutal.",
    },
  });

  // Charlie responde o Post 2 da Alice
  await prisma.post.create({
    data: {
      user_id: charlie.id,
      parent_id: postAlice2.id,
      body: "É chatinho no começo, mas depois que você entende o lance dos cookies HttpOnly, flui bem!",
    },
  });

  console.log("❤️ Distribuindo curtidas (Likes)...");

  await prisma.like.createMany({
    data: [
      { user_id: bob.id, post_id: postAlice1.id },      // Bob curte o post 1 da Alice
      { user_id: charlie.id, post_id: postAlice1.id },  // Charlie curte o post 1 da Alice
      { user_id: diana.id, post_id: postAlice1.id },    // Diana curte o post 1 da Alice
      { user_id: alice.id, post_id: replyBob.id },      // Alice curte a resposta do Bob
      { user_id: alice.id, post_id: postDiana.id },     // Alice curte o post da Diana
      { user_id: bob.id, post_id: postDiana.id },       // Bob curte o post da Diana
    ],
  });

  console.log("🌐 Criando uma sessão de teste...");

  // Simulando que a Alice já está com um Refresh Token válido no banco
  await prisma.session.create({
    data: {
      user_id: alice.id,
      token: "um_refresh_token_aleatorio_e_seguro_aqui_123",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0",
    },
  });

  console.log("✅ Seed concluído com sucesso! Banco populado e pronto para testes.");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });