import type { Loaders } from '../loaders.js';

import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { Post, CreatePostInput, ChangePostInput } from '../types/post.js';
import { Profile, CreateProfileInput, ChangeProfileInput } from '../types/profile.js';
import { User, CreateUserInput, ChangeUserInput } from '../types/user.js';
import { PrismaClient } from '@prisma/client';

interface Context {
  prisma: PrismaClient;
  loaders: Loaders;
}

export const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: () => ({
    createUser: {
      type: new GraphQLNonNull(User),
      args: {
        dto: {
          type: new GraphQLNonNull(CreateUserInput),
        },
      },
      resolve: (
        _: unknown,
        { dto }: { dto: { name: string; balance: number } },
        { prisma }: Context,
      ) => {
        return prisma.user.create({
          data: dto,
        });
      },
    },
    createProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        dto: {
          type: new GraphQLNonNull(CreateProfileInput),
        },
      },
      resolve: (
        _: unknown,
        {
          dto,
        }: {
          dto: {
            isMale: boolean;
            yearOfBirth: number;
            userId: string;
            memberTypeId: string;
          };
        },
        { prisma }: Context,
      ) => {
        return prisma.profile.create({
          data: dto,
        });
      },
    },
    createPost: {
      type: new GraphQLNonNull(Post),
      args: {
        dto: {
          type: new GraphQLNonNull(CreatePostInput),
        },
      },
      resolve: (
        _: unknown,
        { dto }: { dto: { title: string; content: string; authorId: string } },
        { prisma }: Context,
      ) => {
        return prisma.post.create({
          data: dto,
        });
      },
    },
    changePost: {
      type: new GraphQLNonNull(Post),
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
        dto: {
          type: new GraphQLNonNull(ChangePostInput),
        },
      },
      resolve: (
        _: unknown,
        { id, dto }: { id: string; dto: { title?: string; content?: string } },
        { prisma }: Context,
      ) => {
        return prisma.post.update({
          where: { id },
          data: dto,
        });
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
        dto: {
          type: new GraphQLNonNull(ChangeProfileInput),
        },
      },
      resolve: (
        _: unknown,
        {
          id,
          dto,
        }: {
          id: string;
          dto: { isMale?: boolean; yearOfBirth?: number; memberTypeId?: string };
        },
        { prisma }: Context,
      ) => {
        return prisma.profile.update({
          where: { id },
          data: dto,
        });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(User),
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
        dto: {
          type: new GraphQLNonNull(ChangeUserInput),
        },
      },
      resolve: (
        _: unknown,
        { id, dto }: { id: string; dto: { name?: string; balance?: number } },
        { prisma }: Context,
      ) => {
        return prisma.user.update({
          where: { id },
          data: dto,
        });
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        await prisma.user.delete({
          where: { id },
        });
        return id;
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        await prisma.post.delete({
          where: { id },
        });
        return id;
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
        await prisma.profile.delete({
          where: { id },
        });
        return id;
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: {
          type: new GraphQLNonNull(UUIDType),
        },
        authorId: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (
        _: unknown,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: Context,
      ) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });
        return userId;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: {
          type: new GraphQLNonNull(UUIDType),
        },
        authorId: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (
        _: unknown,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: Context,
      ) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });
        return userId;
      },
    },
  }),
});
