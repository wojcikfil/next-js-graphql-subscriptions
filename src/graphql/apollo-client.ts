import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

const graphQlWsLink =
  process.env.NODE_ENV === "development" ? "ws://localhost:3000" : "TODO";
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: graphQlWsLink,
          on: {
            connected: () => console.log("connected client"),
            closed: () => console.log("closed"),
          },
          connectionParams: async () => ({
            session: await getSession(),
          }),
        })
      )
    : null;

const httpLink = new HttpLink({
  uri: `/api/graphql`,
  credentials: "same-origin",
});

const link =
  typeof window !== "undefined" && wsLink != null
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return (
            def.kind === "OperationDefinition" &&
            def.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
