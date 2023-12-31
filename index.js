const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9tzptnp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

async function run() {
    try {
        const usersCollection = client.db('eduDB').collection('users')
        const collagesCollection = client.db('eduDB').collection('collages')
        const candidatesCollection = client.db('eduDB').collection('candidates')
        const reviewsCollection = client.db('eduDB').collection('reviews')

        // Save user email and role in DB
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            console.log(result)
            res.send(result)
        })

        // Get all collages
        app.get('/collages', async (req, res) => {
            const result = await collagesCollection.find().toArray()
            res.send(result)
        })

        // Get a single collage
        app.get('/collage/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await collagesCollection.findOne(query)
            res.send(result)
        })

        // Get data by search 
        app.get("/getCollageByText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await collagesCollection
                .find({
                    $or: [
                        { collegeName: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });


        // Save a candidate in database
        app.post('/candidate', async (req, res) => {
            const candidate = req.body
            const result = await candidatesCollection.insertOne(candidate)
            res.send(result)
        })

        // get collages by email in candidate collection 
        app.get('/candidates/:email', async (req, res) => {
            const email = req.params.email
            const query = { candidateEmail: email }
            const result = await candidatesCollection.find(query).toArray()
            res.send(result)
        })

        // post review 
        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })

        // Get all review 
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 })
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        )
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Edu Bookings Server is running..')
})

app.listen(port, () => {
    console.log(`Edu Bookings is running on port ${port}`)
})