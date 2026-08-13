import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedUser = {
  username: string;
  name: string;
  email: string;
  bio: string;
  city?: string;
  country_code?: string;
};

const USER_DEFS: SeedUser[] = [
  {
    username: "alice_wonder",
    name: "Alice Silva",
    email: "alice@email.com",
    bio: "Exploring the wonderland of code.",
    city: "São Paulo",
    country_code: "BR",
  },
  {
    username: "bob_builder",
    name: "Bob Carter",
    email: "bob@email.com",
    bio: "Can we fix it? Yes we can!",
    city: "Austin",
    country_code: "US",
  },
  {
    username: "charlie_brown",
    name: "Charlie Brown",
    email: "charlie@email.com",
    bio: "Good grief... and good TypeScript.",
    city: "Lisbon",
    country_code: "PT",
  },
  {
    username: "diana_prince",
    name: "Diana Prince",
    email: "diana@email.com",
    bio: "Building peaceful feeds.",
    city: "London",
    country_code: "GB",
  },
  {
    username: "eva_codes",
    name: "Eva Mendes",
    email: "eva@email.com",
    bio: "Frontend craft & design systems.",
    city: "Barcelona",
    country_code: "ES",
  },
  {
    username: "frank_ops",
    name: "Frank Nguyen",
    email: "frank@email.com",
    bio: "DevOps, CI, and coffee.",
    city: "Toronto",
    country_code: "CA",
  },
  {
    username: "gina_data",
    name: "Gina Rossi",
    email: "gina@email.com",
    bio: "SQL by day, Prisma by night.",
    city: "Milan",
    country_code: "IT",
  },
  {
    username: "hugo_mobile",
    name: "Hugo Tanaka",
    email: "hugo@email.com",
    bio: "React Native experimenter.",
    city: "Tokyo",
    country_code: "JP",
  },
  {
    username: "iris_ux",
    name: "Iris Patel",
    email: "iris@email.com",
    bio: "UX writing and product sense.",
    city: "Berlin",
    country_code: "DE",
  },
  {
    username: "jake_api",
    name: "Jake O'Neil",
    email: "jake@email.com",
    bio: "REST, JWTs, and clean routes.",
    city: "Dublin",
    country_code: "IE",
  },
  {
    username: "kira_cloud",
    name: "Kira Andersson",
    email: "kira@email.com",
    bio: "Shipping on the edge.",
    city: "Stockholm",
    country_code: "SE",
  },
  {
    username: "leo_linux",
    name: "Leo Martins",
    email: "leo@email.com",
    bio: "Terminal first. Always.",
    city: "Curitiba",
    country_code: "BR",
  },
  {
    username: "maya_ml",
    name: "Maya Chen",
    email: "maya@email.com",
    bio: "Models, metrics, and notebooks.",
    city: "Singapore",
    country_code: "SG",
  },
  {
    username: "noah_notes",
    name: "Noah Berger",
    email: "noah@email.com",
    bio: "Writing about software for humans.",
    city: "Vienna",
    country_code: "AT",
  },
  {
    username: "olivia_open",
    name: "Olivia Costa",
    email: "olivia@email.com",
    bio: "Open source maintainer vibes.",
    city: "Porto",
    country_code: "PT",
  },
  {
    username: "pete_perf",
    name: "Pete Walker",
    email: "pete@email.com",
    bio: "Performance budgets or bust.",
    city: "Melbourne",
    country_code: "AU",
  },
  {
    username: "quinn_qa",
    name: "Quinn Brooks",
    email: "quinn@email.com",
    bio: "I break things so you don't have to.",
    city: "Chicago",
    country_code: "US",
  },
  {
    username: "rita_react",
    name: "Rita Alvarez",
    email: "rita@email.com",
    bio: "Hooks, forms, and accessibility.",
    city: "Mexico City",
    country_code: "MX",
  },
];

const POST_BODIES = [
  "Just shipped a tiny API with Express and Prisma. Feels great.",
  "Hot take: cursor pagination beats offset pagination for feeds.",
  "Anyone else using Zod on both backend and frontend?",
  "Refresh tokens in httpOnly cookies finally clicked for me.",
  "Design tip: remove one card and the UI instantly looks calmer.",
  "Debugging CORS for the third time today. Send help.",
  "Soft deletes saved our reply threads. Highly recommend.",
  "Tailwind v4 + CSS variables is a nice combo for design tokens.",
  "What is your favorite folder structure for a React app?",
  "I migrated IDs to CUID2 and slept better afterward.",
  "Building a mini social app teaches more than ten tutorials.",
  "JWT access tokens should be short-lived. No debate.",
  "FormData uploads are awkward until they are not.",
  "Following feed vs explore feed: both are useful.",
  "Please validate params and query, not only the body.",
  "A clean empty state is underrated UX.",
  "I keep a seed script spicy so demos never look empty.",
  "React Hook Form + Zod resolver = fewer headaches.",
  "Zustand is perfect when Redux would be overkill.",
  "Dark mode can wait. Clear hierarchy cannot.",
  "If your button does something, give it cursor:pointer.",
  "Edited posts should show when they were updated.",
  "Monorepos are fine for learning projects. Really.",
  "The best architecture is the one you can explain.",
  "Ship the CRUD, then polish the edges.",
];

const REPLY_BODIES = [
  "This is exactly what I needed today.",
  "Agree. Learned that the hard way.",
  "Can you share a snippet?",
  "Bookmarking this.",
  "Same experience over here.",
  "Curious how you handled edge cases.",
  "Solid advice.",
  "I disagree a bit, but I like the framing.",
  "Going to try this tonight.",
  "Thanks for writing this up.",
];

function avatar(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  console.log("Cleaning database...");
  await prisma.session.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Hashing default password (123456)...");
  const passwordHash = await bcrypt.hash("123456", 10);

  console.log(`Creating ${USER_DEFS.length} users...`);
  const users = [];
  for (const def of USER_DEFS) {
    const user = await prisma.user.create({
      data: {
        username: def.username,
        name: def.name,
        email: def.email,
        password: passwordHash,
        role: "USER",
        bio: def.bio,
        city: def.city,
        country_code: def.country_code,
        birth_date: new Date("1995-05-15T00:00:00Z"),
        profile_picture: avatar(def.username),
      },
    });
    users.push(user);
  }

  const byUsername = Object.fromEntries(users.map((u) => [u.username, u]));

  console.log("Creating follow graph...");
  const followPairs: Array<[string, string]> = [
    ["bob_builder", "alice_wonder"],
    ["charlie_brown", "alice_wonder"],
    ["diana_prince", "alice_wonder"],
    ["eva_codes", "alice_wonder"],
    ["alice_wonder", "diana_prince"],
    ["alice_wonder", "eva_codes"],
    ["alice_wonder", "rita_react"],
    ["bob_builder", "diana_prince"],
    ["bob_builder", "frank_ops"],
    ["charlie_brown", "gina_data"],
    ["diana_prince", "iris_ux"],
    ["eva_codes", "rita_react"],
    ["frank_ops", "kira_cloud"],
    ["gina_data", "jake_api"],
    ["hugo_mobile", "rita_react"],
    ["iris_ux", "noah_notes"],
    ["jake_api", "alice_wonder"],
    ["kira_cloud", "frank_ops"],
    ["leo_linux", "alice_wonder"],
    ["leo_linux", "olivia_open"],
    ["maya_ml", "pete_perf"],
    ["noah_notes", "iris_ux"],
    ["olivia_open", "leo_linux"],
    ["pete_perf", "quinn_qa"],
    ["quinn_qa", "pete_perf"],
    ["rita_react", "eva_codes"],
    ["rita_react", "alice_wonder"],
    ["maya_ml", "alice_wonder"],
    ["hugo_mobile", "bob_builder"],
    ["gina_data", "alice_wonder"],
  ];

  await prisma.follow.createMany({
    data: followPairs.map(([follower, followed]) => ({
      follower_id: byUsername[follower].id,
      followed_id: byUsername[followed].id,
    })),
  });

  console.log("Creating posts...");
  const rootPosts = [];
  for (let i = 0; i < POST_BODIES.length; i++) {
    const author = users[i % users.length];
    const createdAt = hoursAgo(POST_BODIES.length - i + Math.floor(i / 3));
    const post = await prisma.post.create({
      data: {
        user_id: author.id,
        body: POST_BODIES[i],
        image:
          i % 7 === 0
            ? "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
            : i % 11 === 0
              ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
              : undefined,
        created_at: createdAt,
        updated_at: createdAt,
      },
    });
    rootPosts.push(post);
  }

  // A few edited posts (updated_at later than created_at)
  for (const index of [1, 5, 12]) {
    await prisma.post.update({
      where: { id: rootPosts[index].id },
      data: {
        body: `${POST_BODIES[index]} (updated with clearer wording)`,
        updated_at: hoursAgo(index),
      },
    });
  }

  // Soft-deleted sample
  await prisma.post.create({
    data: {
      user_id: byUsername.charlie_brown.id,
      body: null,
      image: null,
      is_deleted: true,
      created_at: hoursAgo(40),
    },
  });

  console.log("Creating replies...");
  const replies = [];
  for (let i = 0; i < rootPosts.length; i++) {
    const replyCount = i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
    for (let r = 0; r < replyCount; r++) {
      const author = users[(i + r + 3) % users.length];
      const reply = await prisma.post.create({
        data: {
          user_id: author.id,
          parent_id: rootPosts[i].id,
          body: REPLY_BODIES[(i + r) % REPLY_BODIES.length],
          created_at: hoursAgo(Math.max(1, POST_BODIES.length - i - r)),
        },
      });
      replies.push(reply);
    }
  }

  // Nested reply on the first reply
  if (replies[0]) {
    await prisma.post.create({
      data: {
        user_id: byUsername.alice_wonder.id,
        parent_id: replies[0].id,
        body: "Nested replies make threads feel alive.",
        created_at: hoursAgo(2),
      },
    });
  }

  console.log("Creating likes...");
  const likeData: Array<{ user_id: string; post_id: string }> = [];
  for (let i = 0; i < rootPosts.length; i++) {
    const likers = [
      users[(i + 1) % users.length],
      users[(i + 4) % users.length],
      users[(i + 7) % users.length],
    ];
    for (const liker of likers) {
      likeData.push({ user_id: liker.id, post_id: rootPosts[i].id });
    }
  }
  for (let i = 0; i < Math.min(20, replies.length); i++) {
    likeData.push({
      user_id: users[(i + 2) % users.length].id,
      post_id: replies[i].id,
    });
  }

  // Dedupe unique pairs
  const seen = new Set<string>();
  const uniqueLikes = likeData.filter((like) => {
    const key = `${like.user_id}:${like.post_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await prisma.like.createMany({ data: uniqueLikes });

  console.log("Creating sample session...");
  await prisma.session.create({
    data: {
      user_id: byUsername.alice_wonder.id,
      token: "seed_refresh_token_alice_demo_only",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0",
    },
  });

  console.log(
    `Seed complete: ${users.length} users, ${rootPosts.length} root posts, ${replies.length}+ replies, ${uniqueLikes.length} likes.`,
  );
  console.log("Default password for all users: 123456");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
