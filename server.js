const express = require("express");
const server = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();
const loginRouter = require("./auth/login.js");
const logupRouter = require("./auth/logup.js");
const products = require("./products/products.js");

server.use(cors());
server.use(express.json());
server.use(loginRouter);
server.use(logupRouter);
server.use(products);
server.use(express.static(path.resolve("./build/")));

server.get("/", (req, res) => {
  res.sendFile(path.resolve("./build/index.html"));
});

server.get("/login", (req, res) => {
  res.sendFile(path.resolve("./build/index.html"));
});

server.get("/logup", (req, res) => {
  res.sendFile(path.resolve("./build/index.html"));
});

server.get("/home", (req, res) => {
  res.sendFile(path.resolve("./build/index.html"));
});

server.get("/admin", (req, res) => {
  res.sendFile(path.resolve("./build/index.html"));
});

server.listen(3001, () => {
  console.log("Servidor iniciando...");
});
