import { PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";

import { env } from "../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
import { EventEmitter } from "events";

const biggerEventEmitter = new EventEmitter();
biggerEventEmitter.setMaxListeners(15);
export const pubsub = new PubSub({ eventEmitter: biggerEventEmitter });
