import DataLoader from 'dataloader';
import type { PrismaClient } from '@prisma/client';

export const createLoaders = (prisma: PrismaClient) => {
  const userLoader = new DataLoader<
    string,
    Awaited<ReturnType<typeof prisma.user.findUnique>>
  >(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        id: { in: Array.from(ids) },
      },
    });
    const userMap = new Map(users.map((user) => [user.id, user]));
    return ids.map((id) => userMap.get(id) ?? null);
  });

  const postLoader = new DataLoader<
    string,
    Awaited<ReturnType<typeof prisma.post.findMany>>
  >(async (authorIds) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: Array.from(authorIds) },
      },
    });
    const postsByAuthor = new Map<string, typeof posts>();
    for (const post of posts) {
      const existing = postsByAuthor.get(post.authorId) ?? [];
      existing.push(post);
      postsByAuthor.set(post.authorId, existing);
    }
    return authorIds.map((authorId) => postsByAuthor.get(authorId) ?? []);
  });

  const profileLoader = new DataLoader<
    string,
    Awaited<ReturnType<typeof prisma.profile.findUnique>>
  >(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: { in: Array.from(userIds) },
      },
    });
    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));
    return userIds.map((userId) => profileMap.get(userId) ?? null);
  });

  const memberTypeLoader = new DataLoader<
    string,
    Awaited<ReturnType<typeof prisma.memberType.findUnique>>
  >(async (ids) => {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        id: { in: Array.from(ids) },
      },
    });
    const memberTypeMap = new Map(
      memberTypes.map((memberType) => [memberType.id, memberType]),
    );
    return ids.map((id) => memberTypeMap.get(id) ?? null);
  });

  return {
    userLoader,
    postLoader,
    profileLoader,
    memberTypeLoader,
  };
};

export type Loaders = ReturnType<typeof createLoaders>;
