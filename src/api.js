const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.urlencoded())
// app.use(express.json());
app.use(cors());
const uri = 'mongodb+srv://rhythmgame:rhythmgame@rhythmgame.5b3ushb.mongodb.net/rhythmgamedb?retryWrites=true&w=majority'

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log(error);
    }
}

connect();

const userSchema = new mongoose.Schema({
    username: { type: String, index: { unique: true, dropDups: true } },
    score: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendStatus(200)
})

app.post('/insertUser', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
        });
        await user.save();
        res.send(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.sendStatus(404);
        }
        res.send(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/updateScore', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.sendStatus(404);
        }
        user.score = req.body.score;
        await user.save();
        res.send(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/deleteUser', async (req, res) => {
    try {
        const user = await User.findById({ username: req.body.username });
        if (!user) {
            return res.sendStatus(404);
        }
        await user.remove();
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(PORT, function (err) {
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
});

// execute this job everytime at midnight
schedule.scheduleJob('0 0 * * * ', function () {
    console.log("Deleting old users (>24 hours)");
    // delete users older than 24 hours
    User.deleteMany({ date: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24) } })
        .then(() => {
            console.log("Users deleted successfully");
        })
        .catch((err) => {
            console.log(err);
        });
    console.log("Done");
})
