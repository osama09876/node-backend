import dotenv from "dotenv";
import connectDb from "./db/db.js";

dotenv.config({
  path: "./.env",
});

connectDb();
//   .then(() => {
//     console.log("connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// const app = express();
