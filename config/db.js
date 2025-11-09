const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongo db connected");
  } catch (error) {
    console.error("error while connecting Mongo db:", error);
    throw error; // This will help us see the error in Vercel logs
  }
}

module.exports = connectDB;
