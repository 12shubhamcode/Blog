const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo db connected");
  } catch (error) {
    console.error("error while connecting Mono db", error);
  }
}

module.exports = connectDB;
