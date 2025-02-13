const mongoose = require('mongoose');
//Call Mongo URI from .env file
require('dotenv').config(); 
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;  

if (!uri) {
  console.error("MongoDB URI is not set in environment variables.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000, 
      });
      console.log(" Successfully connected to MongoDB!");
    } catch (error) {
      console.error(" MongoDB Connection Error:", error);
      process.exit(1);
    }
  };

module.exports = { connectDB };
