const { ApolloServer } = require('apollo-server');
const { PrismaClient } = require(`@prisma/client`)
const prisma = new PrismaClient()
const fs = require(`fs`);
const path = require(`path`);
const Query = require (`./resolvers/Query`)
const Mutation = require(`./resolvers/Mutation`)
const User = require(`./resolvers/User`)
const Link = require(`./resolvers/Link`)
const {getUserId} = require(`./utils`)
const { PubSub} = require(`apollo-server`)
const pubsub = new PubSub()

const resolvers = {
        Query,
        Mutation,
        User,
        Link
    
}



const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, `schema.graphql`),
        `utf8`
        ),
        resolvers, 
        context: ({ req }) => {  
            console.log("context is ", req.headers.authorization)
        const result = {
            ...req,
            prisma,
            pubsub,
            userId:
                req && req.headers.authorization
                ? getUserId(req)
                : null
        };
        return result;
    }
});

server
    .listen(4001)
    .then (({url}) => 
    console.log(`Server is running`)
    )