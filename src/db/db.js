import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("MongoDb Connected ", connectionInstance.connection.host);
  } catch (error) {
    console.log("Error connecting: " + error);
    process.exit(1);
  }
  // console.log("Connected");
};

export default connectDb;
