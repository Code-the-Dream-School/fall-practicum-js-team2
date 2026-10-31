const { PrismaClient } = require("@prisma/client");

let opts;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  opts = { log: ["query"] };
} else {
  opts = {};
}

const prisma = new PrismaClient(opts);

module.exports = prisma;