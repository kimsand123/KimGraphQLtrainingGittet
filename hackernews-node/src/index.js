const { ApolloServer } = require('apollo-server');
const { PrismaClient } = require(`@prisma/client`)
const fs = require(`fs`);
const path = require(`path`);

const resolvers = {
    Query: {
        info: (parent, args, context)=> `The server is up`,
        feed: async (parent, args, context) => {
            return context.prisma.link.findMany()
        },
    },

    
    Mutation: {
        post: (parent, args, context, info) => {
            const newLink = context.prisma.link.create({
                data:{
                    url: args.url,
                    description: args.description,
                }
            })
            return newLink
        },          
    },
};



const prisma = new PrismaClient()
const {getUserId} = require(`./utils`);

const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, `schema.graphql`),
        `utf8`
        ),
        resolvers, 
        context: {( req }) => {  
        return {
            ...req,
            prisma,
            userId:
                req && req.headers.authorization
                ? getUserId(req)
                :null
        };
    }
});

server
    .listen()
    .then (({url}) => 
    console.log(`Server is running on ${url}`)
    );