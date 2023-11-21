const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

// const connection = new MongoClient("mongodb://localhost:27017");
const connection = new MongoClient(
  "mongodb+srv://danielmorales:cUGXirOSjUy13yON@cluster0.yd4ps4e.mongodb.net/?retryWrites=true&w=majority"
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await connection.connect();
    let find = await connection
      .db("digitalfuture")
      .collection("users")
      .findOne({ "client.email": email });

    if (!find || !(await argon2.verify(find.client.password, password))) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const rol =
      email === "admin@admin.com" && password === "administrador"
        ? "admin"
        : "user";

    let key = "snapserverKey";
    let token = jwt.sign({ email, rol }, key, {
      expiresIn: "7 days",
    });

    res.status(200).send(
      JSON.stringify({
        email,
        token,
        message: "Login Successfully!",
      })
    );
  } catch (error) {
    res.status(500).send(
      JSON.stringify({
        error: "Login encountered an error.",
      })
    );
  } finally {
    await connection.close();
  }
});

module.exports = router;
