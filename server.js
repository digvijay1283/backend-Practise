const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/loginApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Item Schema for CRUD operations
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized. Please login.' });
    }
};

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();
        res.json({ message: 'Registration successful! Please login.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.userId = user._id;
            req.session.username = user.username;
            res.json({ message: 'Login successful!', username: user.username });
        } else {
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out.' });
        }
        res.json({ message: 'Logout successful!' });
    });
});

// Check auth status
app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// CRUD Operations for Items

// Create item
app.post('/items', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;

    try {
        const item = new Item({
            title,
            description,
            userId: req.session.userId
        });

        await item.save();
        res.json({ message: 'Item created successfully!', item });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Read all items for current user
app.get('/items', isAuthenticated, async (req, res) => {
    try {
        const items = await Item.find({ userId: req.session.userId }).sort({ createdAt: -1 });
        res.json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Read single item
app.get('/items/:id', isAuthenticated, async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.session.userId });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.json({ item });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update item
app.put('/items/:id', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;

    try {
        const item = await Item.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.userId },
            { title, description, updatedAt: Date.now() },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.json({ message: 'Item updated successfully!', item });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete item
app.delete('/items/:id', isAuthenticated, async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });

        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.json({ message: 'Item deleted successfully!' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});