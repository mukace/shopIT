const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDatabase = require("./../config/database");
const Product = require("./../models/Product");
const products = require("./../data/products.json");

// setting up config path
dotenv.config({ path: "backend/config/config.env" });

connectDatabase();


const productSeeder = async () => {
    try {
        await Product.deleteMany();
        console.log("Products are deleted");

        await Product.insertMany(products);
        console.log('Products are inserted');

        process.exit();
    } catch (error) {
        console.log(error);
        process.exit()
    }
}

productSeeder();