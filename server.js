const express = require('express');
const mongoose = require('mongoose');
const app = express();

const uri = 'mongodb+srv://rhythmgame:rhythmgame@rhythmgame.5b3ushb.mongodb.net/?retryWrites=true&w=majority'

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
    username: { type: String, required: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

app.post('/users', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
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

app.put('/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
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

app.delete('/users/:username', async (req, res) => {
    try {
        const user = await User.findById({ username: req.params.username });
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

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
