function info(parent, args, context, info) {
  return "Server is UP!";
}

function feed(parent, args, context, info) {
  return context.prisma.link.findMany();
}

module.exports = {
  info,
  feed,
};
