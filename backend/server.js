const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// handling uncaught excepttions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down the server due to uncaught excepttions');
    process.exit(1);
})

// setting up config file
dotenv.config({ path: 'backend/config/config.env' });

// Database connetion
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})

// handling the unhandelled promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Closing down the server due to unhandelled promise rejection');
    server.close(() => {
        process.exit(1);
    });
});