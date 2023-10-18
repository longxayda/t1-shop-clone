const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

require("dotenv").config();

const user = process.env?.MONGO_USER;
const password = process.env?.MONGO_PASSWORD;
const host = process.env?.MONGO_HOST;

const uri = `mongodb+srv://${user}:${password}@${host}/t1?retryWrites=true&w=majority`;

const app = express();
const port = 5000;

const connect = async (uri) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("CONNECTED");
    return client;
  } catch (error) {
    console.log("CANNOT CONNECT", error);
    await client.close();
  }
};

// USE -> dung cho moi request
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  console.log("FINALLLY");
  res.send("LOGIN IN BUT GET");
});

app.post("/login", async (req, res) => {
  const client = await connect(uri);
  const db = await client.db();
  try {
    db.collection("users")
      .findOne(req.body)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Didnt find user");
      });
  } catch {
    await client.close();
  }
  console.log("END");
});

app.post("/register", async (req, res) => {
  const client = await connect(uri);
  try {
    const db = await client.db();
    db.collection("users")
      .insertOne(req.body)
      .then((res) => console.log("res", res))
      .catch((err) => console.log("err", err));
  } catch {
    await client.close();
  }

  res.send({
    concac: true,
  });
  console.log("END");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post("/products", async (req, res) => {
  const client = await connect(uri);
  const db = await client.db();
  const fakeData = await fetch("https://dummyjson.com/products")
    .then((apiRes) => apiRes.json())
    .then((data) => data.products);
  fakeData.forEach((product) => {
    const newProduct = {};
    Object.keys(product).forEach((key) => {
      if (key.toLowerCase() != "id") {
        newProduct[key] = product[key];
      } else {
        newProduct["_id"] = product[key];
      }
    });
    db.collection("products")
      .insertOne(newProduct)
      .then((res) => {
        console.log(`Inserted product with _id = ${newProduct["_id"]}`);
      })
      .catch((err) => {
        console.log(`Cannot insert product with _id = ${newProduct["_id"]}`);
      })
  });
  res.send("Success");
});

app.get("/products", async (req, res) => {
  const client = await connect(uri);
  const db = await client.db();
  const result = await db.collection("products").find();
  const data = [];
  for await (const doc of result) {
    data.push(doc);
  }
  res.send({
    length: data.length,
    data: data,
  });
});

app.delete("/products", async (req, res) => {
  const client = await connect(uri);
  const db = await client.db();
  res.send(await db.collection("products").drop());
});
