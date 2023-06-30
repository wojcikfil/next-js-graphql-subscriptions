import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { prisma, pubsub } from "../../server/db";
import resolvers from "../../server/graphql/resolvers";
import typeDefs from "../../server/graphql/typeDefs";

import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { Disposable } from "graphql-ws";
import { NextApiHandler } from "next";
import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { getSession } from "next-auth/react";
import { GraphQLContext, Session, SubscriptionContext } from "@/util/types";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const serverCleanup: Disposable | null = null;

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup!.dispose();
          },
        };
      },
    },
  ],
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req): Promise<GraphQLContext> => {
    const session = await getSession({ req });
    return Promise.resolve({ session: session as Session, prisma, pubsub });
  },
});

const getSubscriptionContext = async (
  ctx: SubscriptionContext
): Promise<GraphQLContext> => {
  ctx;
  if (ctx.connectionParams && ctx.connectionParams.session) {
    const { session } = ctx.connectionParams;
    return { session, prisma, pubsub };
  }
  return { session: null, prisma, pubsub };
};

const apolloServerWithWebSocket =
  (handler: NextApiHandler) => async (req: any, res: any) => {
    if (res.socket.server.wss) {
      console.log("Socket is already running");
    } else {
      console.log("Socket is initializing");
      const server = res.socket.server;
      const wss = new WebSocketServer({ noServer: true });
      res.socket.server.wss = wss;
      server.on(
        "upgrade",
        (req: IncomingMessage, socket: Duplex, head: Buffer) => {
          console.log("upgrade", req.url);

          if (!req.url?.includes("/_next/webpack-hmr")) {
            wss.handleUpgrade(req, socket, head, (ws) => {
              wss.emit("connection", ws, req);
            });
            useServer(
              {
                schema,
                context: (ctx: SubscriptionContext) => {
                  // This will be run every time the client sends a subscription request
                  // Returning an object will add that information to our
                  // GraphQL context, which all of our resolvers have access to.
                  return getSubscriptionContext(ctx);
                },
              },
              wss
            );
          }
        }
      );
    }

    await handler(req, res);
  };
export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServerWithWebSocket(handler);
