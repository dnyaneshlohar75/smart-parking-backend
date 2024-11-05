const { Router } = require("express");
const app = Router();

const { default: db } = require("../prisma/db");

const { createWorker } = require("tesseract.js");

app.route("/").get(async (req, res) => {
  res
    .json({ status: "ok", data: { message: "Hello from vender route" } })
    .status(200);
});

app.route("/:venderId/garages").get(async (req, res) => {
  const { venderId } = req.params;

  try {
    const garages = await db.garages.findMany({ where: { venderId } });
    
    return res
      .json({ status: "ok", data: { message: "garages fetched", garages } })
      .status(200);
  } catch (error) {
    console.error(error.message);
    return res
      .json({
        status: "something went wrong",
        data: { message: error.message },
      })
      .status(500);
  }
});

app.route("/:venderId/garages/create").post(async (req, res) => {
  const { venderId } = req.params;
  const payload = req.body;

  try {
    const isVenderVerified = await db.users.findFirst({
      select: { isVerified: true },
      where: { id: venderId },
    });

    if (!isVenderVerified) {
      return res
        .json({
          status: "not verified",
          data: { message: "Vender is not verified" },
        })
        .status(403);
    }

    await db.garages.create({
      data: {
        ...payload,
      },
    });

    return res.json({ status: "ok", data: { message: "new garage created" } });
  } catch (error) {
    console.error(error.message);
    return res
      .json({
        status: "something went wrong",
        data: { message: error.message },
      })
      .status(500);
  }
});

app.route("/get_verification_info").post(async (req, res) => {
  const { imageUrl, documentType } = req.body;
  const worker = await createWorker("eng");

  try {
    const ret = await worker.recognize(imageUrl);

    const text = ret.data.text;

    if (documentType === "aadhar_card") {
      //apply regEx to find card number
      const regEx = /\d{4} \d{4} \d{4}/;
      const match = text.match(regEx);

      if(!match) {
        return res.json({status: "ok", data: {message: "could not fetch details", text: ""}}).status(200);
      }

      return res
        .json({
          status: "ok",
          data: { message: "details fetched", text: match[0] },
        })
        .status(200);
    }

  } catch (error) {
    console.error("[ERROR]", error.message);
    return res
      .json({
        status: "ok",
        data: { message: "something went wrong", error: error.message },
      })
      .status(500);
  } finally {
    await worker.terminate();
  }
});

module.exports = app;
