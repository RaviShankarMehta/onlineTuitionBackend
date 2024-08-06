import express from "express";
import {
  register,
  login,
  logout,
  getMyProfile,
  changePassword,
  updateProfile,
  updateProfilePic,
  forgotPassword,
  resetPassword,
  addToPlaylist,
  removeFromPlaylist,
  getAllUsers,
  updateUserRole,
  deleteUser,
  deleteMyProfile,
} from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// Register
router.route("/register").post(singleUpload, register);

// Login
router.route("/login").post(login);
// LogOut
router.route("/logout").get(logout);

// Get my profile
router.route("/getMyProfile").get(isAuthenticated, getMyProfile);

// Change Password
router.route("/changePassword").put(isAuthenticated, changePassword);

// Update Profile
router.route("/updateProfile").put(isAuthenticated, updateProfile);

// Update Profile Picture
router
  .route("/updateProfilePic")
  .put(isAuthenticated, singleUpload, updateProfilePic);

// Forgot Password
router.route("/forgotPassword").post(isAuthenticated, forgotPassword);

// Reset Password
router.route("/resetPassword/:token").put(isAuthenticated, resetPassword);

// Add to playlist
router.route("/addToPlaylist").post(isAuthenticated, addToPlaylist);

// Remove to playlist
router.route("/removeFromPlaylist").delete(isAuthenticated, removeFromPlaylist);

// Admin Routes
// Get All User
router.route("/admin/users").get(isAuthenticated, authorizedAdmin, getAllUsers);

// Update User Role
router
  .route("/admin/updateUserRole/:id")
  .put(isAuthenticated, authorizedAdmin, updateUserRole);

// Delete User
router
  .route("/admin/deleteUser/:id")
  .delete(isAuthenticated, authorizedAdmin, deleteUser);

// Delete My Profile
router.route("/deleteMyProfile").delete(isAuthenticated, deleteMyProfile);
export default router;
