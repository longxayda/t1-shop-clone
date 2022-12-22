const express = require('express')
const cors = require('cors');
const { MongoClient } = require("mongodb");

const user = 'admin';
const password = 'okmayduoc123';

const uri = `mongodb+srv://${user}:${password}@t1-cluster.gvakzf0.mongodb.net/t1?retryWrites=true&w=majority`

const app = express()
const port = 5000

const connect = async (uri) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("CONNECTED");
        return client;
    }
    catch (error) {
        console.log("CANNOT CONNECT", error)
        await client.close();
    }
}

// USE -> dung cho moi request
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/login', (req, res) => {
    console.log("FINALLLY");
    res.send("LOGIN IN BUT GET");
})

app.post('/login', async (req, res) => {
    const client = await connect(uri);
    const db = await client.db();
    try {
        db.collection('users')
            .findOne(req.body)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.send("Didnt find user");
            })
    }
    catch {
        await client.close();
    }
    console.log("END")
});

app.post('/register', async (req, res) => {
    const client = await connect(uri);
    try {
        const db = await client.db();
        db
            .collection('users')
            .insertOne(req.body)
            .then(res => console.log("res", res))
            .catch(err => console.log("err", err));
    }
    catch {
        await client.close();
    }

    res.send({
        'concac': true
    })
    console.log("END")
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})