import { GraphQLContext } from "@/util/types";
import { GraphQLError } from "graphql";

const resolvers = {
  Query: {
    userByEmail: async function (
      _: any,
      args: { email: string },
      context: GraphQLContext
    ): Promise<any> {
      const { prisma } = context;
      const { email } = args;
      try {
        const user = await prisma.user.findMany({
          where: {
            email: email,
          },
        });
        if (user) return user;
      } catch (error) {
        const typedError = error as Error;
        console.log("getConversation error", typedError);
        throw new GraphQLError(typedError?.message);
      }
    },
  },
};

export default resolvers;
