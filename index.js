const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bikezone.xbiuf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('bikezone');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        // Product insert
        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product);

            res.json(result)
        })
        //Order
        app.post('/placeorder', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order);

            res.json(result)
        })
        //Reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review);

            res.json(result)
        })
        //Get Products Data
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        // Get Orders Data
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        //Get Review Data
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        //Get Review Data
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        // Find Place order Data
        app.get('/placeorder/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.json(result)
        })
        //Admin Identify

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'Admin') {
                isAdmin = true
            }
            console.log(isAdmin)
            res.json({ admin: isAdmin })
        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user);

            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body

            const filter = { email: user.email }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    name: user.name,
                    email: user.email
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)

            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body

            const filter = { email: user.email }

            const updateDoc = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        app.put('/orders/confirm', async (req, res) => {

            const { orderId } = req.body

            const filter = { _id: ObjectId(orderId) }

            const updateDoc = {
                $set: {
                    status: 'Shipped'
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.json(result)
        })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server Running')
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
})