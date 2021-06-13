const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

const errorMiddleware = require('./middlewares/error');

// middlewares
app.use(express.json())
app.use(cookieParser());

// Importing Routes
const products = require('./routes/product');
const auth = require('./routes/auth');
const user = require('./routes/user');
const order = require('./routes/order');

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', user);
app.use('/api/v1', order);

// Error Middleware
app.use(errorMiddleware);

module.exports = app;