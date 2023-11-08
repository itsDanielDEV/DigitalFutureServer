const express = require("express");
const { MongoClient } = require("mongodb");
const router = express.Router();
const bcrypt = require("bcrypt");

// const connection = new MongoClient("mongodb://localhost:27017");
const connection = new MongoClient(
  "mongodb+srv://danielmorales:cUGXirOSjUy13yON@cluster0.yd4ps4e.mongodb.net/?retryWrites=true&w=majority"
);

router.post("/logup", async (req, res) => {
  const { firstName, lastName, email, password, address } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  let user = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    address,
  };

  try {
    await connection.connect();
    await connection
      .db("digitalfuture")
      .collection("users")
      .insertOne({ client: user });
  } catch (error) {
    res.status(500).send(
      JSON.stringify({
        error: "Registration encountered an error.",
      })
    );
  } finally {
    await connection.close();
  }

  res.status(200).send(
    JSON.stringify({
      name: firstName,
      email,
      message: "Registered Successfully!",
    })
  );
});

module.exports = router;
