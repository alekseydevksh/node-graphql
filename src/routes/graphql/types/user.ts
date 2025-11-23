import type { PrismaClient } from '@prisma/client';
import type { Loaders } from '../loaders.js';

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
  loaders: Loaders;
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
      resolve: (parent: { id: string }, _: unknown, { loaders }: Context) => {
        return loaders.profileLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: (parent: { id: string }, _: unknown, { loaders }: Context) => {
        return loaders.postLoader.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (
        parent: { id: string },
        _: unknown,
        { loaders }: Context,
      ) => {
        const authorIds = await loaders.userSubscribedToLoader.load(parent.id);
        if (authorIds.length === 0) {
          return [];
        }
        return Promise.all(authorIds.map((id) => loaders.userLoader.load(id))).then(
          (users) =>
            users.filter((user): user is NonNullable<typeof user> => user !== null),
        );
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (
        parent: { id: string },
        _: unknown,
        { loaders }: Context,
      ) => {
        const subscriberIds = await loaders.subscribedToUserLoader.load(parent.id);
        if (subscriberIds.length === 0) {
          return [];
        }
        return Promise.all(subscriberIds.map((id) => loaders.userLoader.load(id))).then(
          (users) =>
            users.filter((user): user is NonNullable<typeof user> => user !== null),
        );
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
