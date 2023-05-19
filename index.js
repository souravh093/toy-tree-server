const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Toy Tree Server is go on");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukmkwhb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toysDB").collection("toys");

    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    app.post("/addToys", async (req, res) => {
      const doc = req.body;
      const result = await toyCollection.insertOne(doc);
      res.send(result);
    });

    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const toys = {
        $set: {
          price: data.price,
          availableQuantity: data.availableQuantity,
          detailsDescription: data.detailsDescription,
        },
      };

      const result = await toyCollection.updateOne(query, toys, option);
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    });

    app.get("/category/:category", async (req, res) => {
      const category = req.params.category;
      const option = {
        projection: {
          name: 1,
          photoUrl: 1,
          price: 1,
          rating: 1,
          subcategory: 1,
        },
      };
      const result = await toyCollection
        .find({ subcategory: category }, option)
        .toArray();
      res.send(result);
    });

    app.get("/categoryDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      const email = req.params.email;
      const result = await toyCollection.find({ sellerEmail: email }).toArray();
      res.send(result);
    });

    app.get("/searchByTitle/:searchKey", async (req, res) => {
      const searchKey = req.params.searchKey;

      const result = await toyCollection
        .find({
          name: { $regex: searchKey, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
