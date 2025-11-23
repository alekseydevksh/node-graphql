import type { Loaders } from '../loaders.js';

import { GraphQLObjectType, GraphQLNonNull, GraphQLList } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberType, MemberTypeIdEnum } from '../types/member-type.js';
import { Post } from '../types/post.js';
import { Profile } from '../types/profile.js';
import { User } from '../types/user.js';
import { PrismaClient } from '@prisma/client';

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
      resolve: (_: unknown, __: unknown, { prisma }: Context) => {
        return prisma.user.findMany();
      },
    },
    user: {
      type: User,
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
