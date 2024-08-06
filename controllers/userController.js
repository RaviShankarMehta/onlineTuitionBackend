import catchAsyncError from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/user.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/course.js";
import cloudinary from "cloudinary";
import getDateUri from "../utils/dataUri.js";
import { Stats } from "../models/stats.js";
// Register
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file) {
    return next(new ErrorHandler("Please enter all field", 400));
  }
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User Already Exist.", 409));
  //   Upload file on cloudinary
  const fileUri = getDateUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sendToken(res, user, "Registered Successfully", 201);
});

// Login
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // const file = req.file
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all field", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User doesn't Exist.", 401));
  //   Upload file on cloudinary
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Invalid credential", 401));

  sendToken(res, user, `Welcome ${user.name}`, 201);
});

// Logout
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

// Profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

// CHANGE PASSWORD
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please enter all field", 400));
  }
  const user = await User.findById(req.user._id).select("password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect Old Password", 400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed Successfully",
  });
});

// UPDATE PROFILE
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Update profile Successfully",
  });
});

// UPDATE PROFILE PIC
export const updateProfilePic = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next(new ErrorHandler("Please upload the file", 400));
  }
  const user = await User.findById(req.user._id);

  const fileUri = getDateUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();
  res.status(200).json({
    success: true,
    message: "Update profile Successfully",
  });
});

// FORGOT PASSWORD
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found"), 400);

  const resetToken = await user.getResetToken();

  await user.save();
  const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  const message = `Click on the link to reset your password. ${url}. If yor have not requested then please ignore`;
  // sent token via email
  await sendEmail(user.email, "Online Tuition Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset token has been send Successfully on this ${user.email}`,
  });
});

// RESET PASSWORD
export const resetPassword = catchAsyncError(async (req, res, next) => {
  let { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expires"));

  user.password = req.body.password;

  (user.resetPasswordToken = undefined),
    (user.resetPasswordExpire = undefined),
    await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed Successfully",
  });
});

// ADD TO PLAYLIST
export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 400));
  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });
  if (itemExist) return next(new ErrorHandler("Item Already Exits", 409));
  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();
  res.status(200).json({
    success: true,
    message: "Added to playlist Successfully",
  });
});

// REMOVE FORM PLAYLIST
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 400));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return true;
  });
  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed From playlist Successfully",
  });
});

//ADMIN ROUTE
// GET ALL USERS
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
  });
});

// UPDATE USER ROLE
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  if (user.role === "user") user.role = "admin";
  else user.role = "user";
  await user.save();
  res.status(200).json({
    success: true,
    message: "User role update Successfully",
  });
});

// DELETE USER
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  // cancel subscription
  await user.deleteOne({ _id: req.params.id });
  res.status(200).json({
    success: true,
    message: "Delete User Successfully",
  });
});

// DELETE MY PROFILE
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  // cancel subscription
  await user.deleteOne({ _id: req.params.id });

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Delete Profile Successfully",
    });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  const subscription = await User.find({ "subscription.status": "active" });
  stats[0].users = await User.countDocuments();
  stats[0].subscription = await User.subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
