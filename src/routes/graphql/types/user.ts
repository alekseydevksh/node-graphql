import type { PrismaClient } from '@prisma/client';

import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { Post } from './post.js';
import { Profile } from './profile.js';

interface Context {
  prisma: PrismaClient;
}

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: Profile,
      resolve: (parent: { id: string }, _: unknown, { prisma }: Context) => {
        return prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: (parent: { id: string }, _: unknown, { prisma }: Context) => {
        return prisma.post.findMany({
          where: { authorId: parent.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent: { id: string }, _: unknown, { prisma }: Context) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: parent.id },
          select: { authorId: true },
        });
        const authorIds = subscriptions.map((sub) => sub.authorId);
        if (authorIds.length === 0) {
          return [];
        }
        return prisma.user.findMany({
          where: { id: { in: authorIds } },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent: { id: string }, _: unknown, { prisma }: Context) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: parent.id },
          select: { subscriberId: true },
        });
        const subscriberIds = subscriptions.map((sub) => sub.subscriberId);
        if (subscriberIds.length === 0) {
          return [];
        }
        return prisma.user.findMany({
          where: { id: { in: subscriberIds } },
        });
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  }),
});

