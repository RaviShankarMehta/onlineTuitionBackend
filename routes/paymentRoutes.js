import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  buySubscription,
  cancelSubscription,
  getRazorPayKey,
  paymentVerification,
} from "../controllers/paymentController.js";

const router = express.Router();

// BUY SUBSCRIPTION
router.route("/buySubscription").get(isAuthenticated, buySubscription);

// VERIFY PAYMENT AND SAVE REFERENCE IN DATABASE
router.route("/paymentVerification").post(isAuthenticated, paymentVerification);

// GET RAZORPAY KEY
router.route("/getRazorPayKey").get(getRazorPayKey);

router.route("/cancelSubscription").delete(isAuthenticated, cancelSubscription);

export default router;
