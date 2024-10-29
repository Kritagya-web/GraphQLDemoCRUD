const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const MONGODB = "mongodb+srv://kritagya:dragonball@cluster0.y2twj.mongodb.net/";

//  Apollo Server
// Typedef : GraphQL Type Definations
// Resolvers: How do we resolve queries / mutations
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB Connected");
    return server.listen({ port: 5000 });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  });
// 69hCz60k7BZ5141M
