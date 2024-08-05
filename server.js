import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import { Stats } from "./models/stats.js";

// Connect to the database
connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed", error);
  });

cloudinary.v2.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

export const instance = new Razorpay({
  key_id: `${process.env.RAZORPAY_API_KEY}`,
  key_secret: `${process.env.RAZORPAY_API_SECRET}`,
});

nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

app.get("/", (req, res) => {
  res.send("<h1>Hello, this is the home page!</h1>");
});
// const temp = async () => {
//   await Stats.create({});
// };
// temp();
// Start the server
const PORT = process.env.PORT || 4000;
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server startup error:", err);
  });
