import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, specifiedRules, parse, GraphQLSchema } from 'graphql';
import { RootQueryType } from './resolvers/queries.js';
import { Mutations } from './resolvers/mutations.js';
import depthLimit from 'graphql-depth-limit';
import { createLoaders } from './loaders.js';

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutations,
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const document = parse(req.body.query);
      const validationErrors = validate(schema, document, [
        ...specifiedRules,
        depthLimit(5),
      ]);

      if (validationErrors.length > 0) {
        return {
          errors: validationErrors,
        };
      }

      const loaders = createLoaders(prisma);

      const result = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        rootValue: {},
        contextValue: { prisma, loaders },
        fieldResolver: undefined,
        typeResolver: undefined,
      });

      return result;
    },
  });
};

export default plugin;
