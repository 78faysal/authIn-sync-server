const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



// midleware
app.options('*', cors())
app.use(cors({ origin: ['https://auto-in-sync.netlify.app/'] }));
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jq69c8i.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // client.connect();

        const productsCollection = client.db('AutoInSync').collection('products');
        const cartCollection = client.db('AutoInSync').collection('cartProducts');



        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            next();
        })

        app.get('/products', async (req, res) => {
            const cursor = await productsCollection.find();
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        })

        app.get('/products/:brand', async (req, res) => {
            const brand = req.params.brand;
            const quary = { brand: brand }
            const cursor = await productsCollection.find(quary);
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const quary = await { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(quary);
            res.send(result);
        })

        app.get('/cartProducts', async (req, res) => {
            const cursor = await cartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/cartProducts/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await cartCollection.findOne(quary);
            // console.log(result);
            res.send(result)
        })


        app.put('/cartProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCart = req.body;
            const cart = {
                $set: {
                    name: updatedCart.name,
                    brand: updatedCart.brand,
                    category: updatedCart.category,
                    rating: updatedCart.rating,
                    description: updatedCart.description,
                    photo: updatedCart.photo
                }
            }

            const result = await cartCollection.updateOne(filter, cart, options);
            res.send(result);
        })

        app.post('/products', async (req, res) => {
            const quary = req.body;
            const result = await productsCollection.insertOne(quary);
            res.send(result)
        })

        app.post('/cartProducts', async (req, res) => {
            const quary = req.body;
            const result = await cartCollection.insertOne(quary);
            res.send(result);
        })


        app.delete('/cartProducts/:id', async (req, res) => {
            const id = req.params.id;
            const quary = await { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(quary);
            // console.log(result);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('AUTOINSYNC server is running')
})


app.listen(port, () => {
    console.log('listening to port', port);
})