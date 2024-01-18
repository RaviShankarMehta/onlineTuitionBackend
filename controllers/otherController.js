import catchAsyncError from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/stats.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("All Fields are mandatory"));
  const to = process.env.MY_MAIL;
  const subject = "Contact from OnlineTuition";
  const text = `I am ${name} and my Email is ${email}. \n${message}`;
  await sendEmail(to, subject, text);
  res.status(200).json({
    success: true,
    message: "Your message has been sent.",
  });
});

export const courseRequest = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("All Fields are mandatory"));
  const to = process.env.MY_MAIL;
  const subject = "Request for a course on OnlineTuition";
  const text = `I am ${name} and my Email is ${email}. \n${course}`;
  await sendEmail(to, subject, text);
  res.status(200).json({
    success: true,
    message: "Your request has been sent.",
  });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);

  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }
  const requiredSize = 12 - stats.length;

  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }

  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let usersProfit = true;
  let subscriptionsProfit = true;
  let viewsProfit = true;
  let usersPercentage = 0;
  let subscriptionsPercentage = 0;
  let viewsPercentage = 0;

  if (statsData[10].users === 0) usersPercentage = usersCount * 100;
  if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercentage = subscriptionsCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      views: statsData[11].views - statsData[10].views,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
    };
    usersPercentage = (difference.users / statsData[10].users) * 100;
    viewsPercentage = (difference.views / statsData[10].views) * 100;
    subscriptionsPercentage =
      (difference.subscriptions / statsData[10].subscriptions) * 100;
    if (usersPercentage < 0) usersProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionsPercentage < 0) subscriptionsProfit = false;
  }

  res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    viewsCount,
    subscriptionsCount,
    usersPercentage,
    viewsPercentage,
    subscriptionsPercentage,
    usersProfit,
    viewsProfit,
    subscriptionsProfit,
  });
});
