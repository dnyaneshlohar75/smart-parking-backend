const { Router } = require("express");
const app = Router();

const prisma = require("../prisma/db");

app.route("/").get(async (req, res) => {
  res
    .json({ status: "ok", data: { message: "Hello from user route" } })
    .status(200);
});

app.route("/getusers").get(async (req, res) => {

  try {
    const user = await prisma.users.findMany();
    
    return res.json({user})
  } catch(e) {
    return res.json({e})
  }
})

app.route("/signup").post(async (req, res) => {
  const payload = req.body;

  try {
    const exist = await prisma.users.findFirst({
      select: { id: true },
      where: { email: payload?.emailId },
    });

    if (exist) {
      return res
        .json({
          status: "user exist",
          data: {
            message: "email id already exist, try different email id",
          },
        })
        .status(409);
    }

    const bcrypt = require("bcrypt");
    const saltRounds = 18;

    const hash = await bcrypt.hash(payload?.password, saltRounds);

    if (payload?.role === "VENDER") {
      await prisma.users.create({
        data: {
          name: payload?.name,
          email: payload?.emailId,
          password: hash,
          role: "VENDER",
        },
      });
    }

    const user = await prisma.users.create({
      data: {
        name: payload?.name,
        email: payload?.emailId,
        password: hash,
        role: "USER",
      },
    });

    return res
      .json({ status: "ok", data: { message: "created", userId: user.id } })
      .status(201);
  } catch (e) {
    console.log("ERROR: ", e.message);

    return res
      .json({
        status: "error",
        data: { message: "Unable to signup", error: e.message },
      })
      .status(400);
  }
});

app.route("/login").post(async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const user = await prisma.users.findFirst({ where: { email: emailId } });

    if (!user) {
      return res
        .json({ status: "ok", data: { message: "user not found" } })
        .status(404);
    }

    const bcrypt = require("bcrypt");

    const isUserAuthentic = bcrypt.compareSync(password, user.password);

    if (!isUserAuthentic) {
      return res
        .json({ status: "ok", data: { message: "Password does not match" } })
        .status(200);
    }

    return res
      .json({ status: "ok", data: { message: "login successful", user } })
      .status(200);
  } catch (error) {
    console.log(error.message);
    return res
      .json({
        status: "something went wrong",
        data: { message: "Internal Server Error", error: error.message },
      })
      .status(500);
  }
});

module.exports = app;
