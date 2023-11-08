const express = require("express");
const router = express.Router();
const { MongoClient, ServerApiVersion } = require("mongodb");
// const connection = new MongoClient("mongodb://localhost:27017");

let uri =
  "mongodb+srv://danielmorales:cUGXirOSjUy13yON@cluster0.yd4ps4e.mongodb.net/?retryWrites=true&w=majority";
const connection = new MongoClient(uri);

const jwt = require("jsonwebtoken");

let key = "snapserverKey";

router.get("/producto/categorias", async (req, res) => {
  let categories = [];
  try {
    await connection.connect();

    categories = await connection
      .db("digitalfuture")
      .collection("categories")
      .find({})
      .toArray();
  } catch (error) {
    console.log(error);
  } finally {
    await connection.close();
  }
  res.json(JSON.parse(JSON.stringify({ categories })));
});

router.get("/producto/", async (req, res) => {
  const token = req.header("authorization");

  if (!token) {
    res.status(401).send("Access denied");
    return;
  }

  try {
    jwt.verify(token, key);
    let products = [];
    try {
      await connection.connect();

      products = await connection
        .db("digitalfuture")
        .collection("products")
        .find({})
        .toArray();
    } catch (error) {
      console.log(error);
    } finally {
      await connection.close();
    }

    res.json(JSON.parse(JSON.stringify({ products })));
  } catch (error) {
    res
      .status(401)
      .send(JSON.stringify({ error: "Access denied! Token invalid" }));
  }
});

router.get("/producto/invitado", async (req, res) => {
  try {
    let products = [];
    try {
      await connection.connect();

      products = await connection
        .db("digitalfuture")
        .collection("products")
        .find({})
        .limit(8)
        .toArray();
    } catch (error) {
      console.log(error);
    } finally {
      await connection.close();
    }

    res.json(JSON.parse(JSON.stringify({ products })));
  } catch (error) {
    res
      .status(401)
      .send(JSON.stringify({ error: "Access denied! Token invalid" }));
  }
});

router.get("/producto/:id", async (req, res) => {
  const token = req.header("authorization");

  if (!token) {
    res.status(401).send("Access denied");
    return;
  }

  try {
    jwt.verify(token, key);
    const productId = parseInt(req.params.id);
    let product = null;
    try {
      await connection.connect();

      product = await connection
        .db("digitalfuture")
        .collection("products")
        .findOne({ id: productId });
    } catch (error) {
      console.log(error);
    } finally {
      await connection.close();
    }

    if (!product) {
      res.status(404).send("Product not found");
    } else {
      res.json(JSON.parse(JSON.stringify({ product })));
    }
  } catch (error) {
    res
      .status(401)
      .send(JSON.stringify({ error: "Access denied! Token invalid" }));
  }
});

router.post("/producto", async (req, res) => {
  const token = req.header("authorization");

  if (!token) {
    return res.status(401).json({
      error: "Authorization token is required to access this resource.",
    });
  }

  const decode = jwt.verify(token, key);
  const rol = decode.rol;

  if (rol === "user") {
    return res
      .status(403)
      .json({ error: "Access forbidden. Insufficient privileges." });
  } else if (rol === "admin") {
    try {
      const {
        product: { id, title, price, description, category, imgURL, quantity },
      } = req.body;

      let newProduct = {
        id,
        title,
        price,
        description,
        category,
        image: imgURL,
        quantity,
      };

      await connection.connect();

      // console.log(newProduct);

      await connection
        .db("digitalfuture")
        .collection("products")
        .insertOne(newProduct);

      res.status(200).json({ message: "Product successfully added" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the product" });
    } finally {
      await connection.close();
    }
  }
});

router.delete("/producto/:id", async (req, res) => {
  const token = req.header("authorization");

  if (!token) {
    return res.status(401).json({
      error: "Authorization token is required to access this resource.",
    });
  }

  const decode = jwt.verify(token, key);
  const rol = decode.rol;

  // console.log(decode);
  // console.log(decode.rol);

  if (rol === "user") {
    return res
      .status(403)
      .json({ error: "Access forbidden. Insufficient privileges." });
  } else if (rol === "admin") {
    try {
      let productId = parseInt(req.params.id);
      // console.log(productId);
      await connection.connect();

      const result = await connection
        .db("digitalfuture")
        .collection("products")
        .deleteOne({ id: productId });

      if (result.deletedCount === 0) {
        res.status(404).json({ message: "Product not found" });
      } else {
        res.status(200).json({ message: "Product successfully deleted" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "An error occurred while deleting the product" });
    } finally {
      await connection.close();
    }
  }
});

router.put("/producto/:id", async (req, res) => {
  const token = req.header("authorization");

  if (!token) {
    return res.status(401).json({
      error: "Authorization token is required to access this resource.",
    });
  }

  const decode = jwt.verify(token, key);
  const rol = decode.rol;

  // console.log(decode);
  // console.log(decode.rol);

  if (rol === "user") {
    return res
      .status(403)
      .json({ error: "Access forbidden. Insufficient privileges." });
  } else if (rol === "admin") {
    try {
      let updatedProduct = {
        $set: req.body["product"],
      };
      let productId = parseInt(req.params.id);
      // console.log(productId);
      await connection.connect();

      const result = await connection
        .db("digitalfuture")
        .collection("products")
        .updateOne({ id: productId }, updatedProduct);

      res.status(200).json({ message: "Product successfully updated" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "An error occurred while deleting the product" });
    } finally {
      await connection.close();
    }
  }
});

router.post("/producto/compra", async (req, res) => {
  const token = req.header("authorization");
  const data = req.body;
  // console.log(data);

  if (!token) {
    return res.status(401).json({
      error: "Authorization token is required to access this resource.",
    });
  }

  try {
    const decode = jwt.verify(token, key);
    const email = decode["email"];

    await connection.connect();

    const client = await connection
      .db("digitalfuture")
      .collection("users")
      .findOne({ "client.email": email });

    // console.log(client);
    // console.log(data);

    // console.log(data.purchase[0].quantity);

    // console.log("data;", data);
    let purchase = [];
    await Promise.all(
      data.purchase.map(async (product) => {
        const id = product.id;
        const quantitySold = product.quantity;

        let quantityCurrentProduct = await connection
          .db("digitalfuture")
          .collection("products")
          .findOne({ id });
        quantityCurrentProduct = await quantityCurrentProduct.quantity;

        // console.log("quantityCurrentProduct: ", quantityCurrentProduct);
        // console.log("quantitySold: ", quantitySold);
        if (
          quantityCurrentProduct - quantitySold < 0 ||
          quantityCurrentProduct < quantitySold
        ) {
          return res.status(400).json({
            error: "The requested quantity exceeds the stock availability.",
          });
        }

        purchase.push(product);

        await connection
          .db("digitalfuture")
          .collection("products")
          .updateMany({ id }, { $inc: { quantity: -quantitySold } });

        // console.log(product);
        // console.log("quantityCurrentProduct: ", quantityCurrentProduct);
        // console.log(quantitySold);
      })
    );

    await connection
      .db("digitalfuture")
      .collection("purchases")
      .insertOne({
        client: client["client"],
        purchase: JSON.parse(JSON.stringify(purchase)),
      });

    return res.status(200).json({
      message: "Purchase successfully completed.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred during the purchase. Please try again later.",
    });
  } finally {
    await connection.close();
  }
});

module.exports = router;
