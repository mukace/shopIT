const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })

        console.log(`MongoDB database connected`)
    } catch (error) {
        console.log(`failed to connect to the MonoDB database, ${error}`);
        console.log('Shutting down the server due to error in database connection')
        process.exit(1);
    }
}

module.exports = connectDatabase;