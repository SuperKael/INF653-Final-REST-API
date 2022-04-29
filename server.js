// Load .env configuration
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// Port to bind the server to
const PORT = process.env.PORT || 80;

// Initiate database connection. This would take a while,
// so it is best started as soon as possible.
mongoose.connect(process.env.DATABASE_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

// CORS
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    optionsSuccessStatus: 200
}));

// Pre-processing middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the ./public directory.
app.use('/', express.static(path.join(__dirname, '/public')));

// Routes
app.use('/', require('./routes/root'))
app.use('/states', require('./routes/states'))

// 404 Handler
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// Setup complete and DB connection established - initialize server
mongoose.connection.once('connected', () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});