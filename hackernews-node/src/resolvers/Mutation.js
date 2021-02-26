const bcrypt = require("bcryptjs");
const jwt = require(`jsonwebtoken`)
const  { APP_SECRET, getUserId} = require('../utils');
const { newLink } = require("./Subscription");

console.log(bcrypt)

async function signup (parent, args, context, info){
    try{
        const password = await bcrypt.hash(args.password, 10)
        const user = await context.prisma.user.create({data:{...args, password}})
        const token = jwt.sign({userId: user.id}, APP_SECRET)
        return {
            token,
            user,
        }
    } catch (err){
        console.log(err)
    }
}

async function login (parent, args, context, info){
    const user = await context.prisma.user.findUnique({where:{email:args.email}})
    if (!user){
        throw new error(`No such user found`)
    }

    const valid = await bcrypt.compare(args.password, user.password)
    if(!valid) {
        throw new Error(`Invalid password`)
    }

    const token = jwt.sign({userId: user.id}, APP_SECRET)

    return {
        token,
        user,
    }
}

async function post(parent, args, context, info){
    const { userId } = context;

    return await context.prisma.link.create({
        data:{
            url:args.url,
            description: args.description,
            postedBy: {connect: { id:userId}},
        }
    })
    context.pubsub.publish("NEW_LINK", newLink)
    return newLink
}

module.exports={
    signup,
    login,
    post
}