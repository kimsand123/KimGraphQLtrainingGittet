const { ApolloServer } = require("apollo-server");
const { PrismaClient } = require(`@prisma/client`);
const prisma = new PrismaClient();
const fs = require(`fs`);
const path = require(`path`);
const Query = require(`./resolvers/Query`);
const Mutation = require(`./resolvers/Mutation`);
const User = require(`./resolvers/User`);
const Link = require(`./resolvers/Link`);
const { getUserId } = require(`./utils`);
const { PubSub } = require(`apollo-server`);
const pubsub = new PubSub();
const Subscription = require(`./resolvers/Subscription`);
const Vote = require(`./resolvers/Vote`);

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, `schema.graphql`), `utf8`),
  resolvers,
  context: ({ req, connection }) => {
    let auth = null;
    if (req && req.headers.authorization) {
      auth = req.headers.authorization;
    } else if (connection && connection.context.authorization) {
      auth = connection.context.authorization;
    }
    console.log(`Auth: ${auth}`);
    const result = {
      ...req,
      prisma,
      pubsub,
      userId: auth ? getUserId(auth) : null,
    };
    return result;
  },
  formatError: (err) => {
    if (err && err.extensions.exception)
      console.log(err.extensions.exception.stacktrace);
    return err;
  },
});

server.listen(4001).then(({ url }) => console.log(`Server is running`));
