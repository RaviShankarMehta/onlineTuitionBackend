import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors"
config({ path: "./config/config.env" });
const app = express();

// Using Middlewares
app.use(cors())
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser())

// Importing & Using Routes
import course from "./routes/courseRoutes.js";
import user from "./routes/userRoutes.js";
import payment from "./routes/paymentRoutes.js";
import other from "./routes/otherRoutes.js";
import home from "./routes/home.js";

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);
app.use("/homes", home);

app.use(ErrorMiddleware);
export default app;

