import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date

  type User {
    id: String
    name: String
  }

  type Query {
    userByEmail(email: String!): [User]
  }
`;

export default typeDefs;
