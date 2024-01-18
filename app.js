import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({ path: "./config/config.env" });
const app = express();

// Using Middlewares

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_L0CAL_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// Importing & Using Routes
import course from "./routes/courseRoutes.js";
import user from "./routes/userRoutes.js";
import payment from "./routes/paymentRoutes.js";
import other from "./routes/otherRoutes.js";

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);
app.get("/", function(req, res) {
  res.send("Hello, this is the home page!");
});
app.use(ErrorMiddleware);
export default app;
