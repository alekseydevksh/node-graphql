import type { Loaders } from '../loaders.js';
import type { GraphQLResolveInfo } from 'graphql';

import { GraphQLObjectType, GraphQLNonNull, GraphQLList } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberType, MemberTypeIdEnum } from '../types/member-type.js';
import { Post } from '../types/post.js';
import { Profile } from '../types/profile.js';
import { User } from '../types/user.js';
import { PrismaClient } from '@prisma/client';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

interface Context {
  prisma: PrismaClient;
  loaders: Loaders;
}

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: (_: unknown, __: unknown, { prisma }: Context) => {
        return prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: {
          type: new GraphQLNonNull(MemberTypeIdEnum),
        },
      },
      resolve: (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        return prisma.memberType.findUnique({
          where: { id },
        });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (
        _: unknown,
        __: unknown,
        { prisma, loaders }: Context,
        info: GraphQLResolveInfo,
      ) => {
        const parsedInfo = parseResolveInfo(info) as {
          fieldsByTypeName?: { User?: Record<string, unknown> };
        } | null;
        const fields = parsedInfo?.fieldsByTypeName?.User;

        const needsUserSubscribedTo = Boolean(fields?.userSubscribedTo);
        const needsSubscribedToUser = Boolean(fields?.subscribedToUser);

        const include: {
          userSubscribedTo?: boolean;
          subscribedToUser?: boolean;
        } = {};

        if (needsUserSubscribedTo) {
          include.userSubscribedTo = true;
        }
        if (needsSubscribedToUser) {
          include.subscribedToUser = true;
        }

        const users = await prisma.user.findMany({
          include: Object.keys(include).length > 0 ? include : undefined,
        });

        // Prime the DataLoader cache
        for (const user of users) {
          loaders.userLoader.prime(user.id, user);
        }

        // Prime subscription loaders if relations were included
        if (needsUserSubscribedTo || needsSubscribedToUser) {
          for (const user of users) {
            const userWithRelations = user as typeof user & {
              userSubscribedTo?: Array<{ authorId: string }>;
              subscribedToUser?: Array<{ subscriberId: string }>;
            };
            if (needsUserSubscribedTo && userWithRelations.userSubscribedTo) {
              const authorIds = userWithRelations.userSubscribedTo.map((sub) => sub.authorId);
              loaders.userSubscribedToLoader.prime(user.id, authorIds);
            }
            if (needsSubscribedToUser && userWithRelations.subscribedToUser) {
              const subscriberIds = userWithRelations.subscribedToUser.map((sub) => sub.subscriberId);
              loaders.subscribedToUserLoader.prime(user.id, subscriberIds);
            }
          }
        }

        return users;
      },
    },
    user: {
      type: User as GraphQLObjectType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        return prisma.user.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: (_: unknown, __: unknown, { prisma }: Context) => {
        return prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        return prisma.post.findUnique({
          where: { id },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: (_: unknown, __: unknown, { prisma }: Context) => {
        return prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        return prisma.profile.findUnique({
          where: { id },
        });
      },
    },
  }),
});
