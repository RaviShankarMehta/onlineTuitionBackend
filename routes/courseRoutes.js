import express from "express";
import {
  getAllCourses,
  createCourse,
  getCourseLecture,
  addLecture,
  deleteCourse,
  deleteLecture,
} from "../Controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizedAdmin, authorizedSubscriber, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Get All Courses Without lecture
router.route("/course").get(getAllCourses);

// Create new Course -Only admin
router.route("/createCourse").post(isAuthenticated, authorizedAdmin, singleUpload, createCourse);

//  Add lecture , Delete Course, Get Course Details
router
  .route("/getCourseLecture/:id")
  .get(isAuthenticated,authorizedSubscriber,getCourseLecture)

  router
  .route("/addLecture/:id").post(isAuthenticated,authorizedAdmin, singleUpload, addLecture);
//  Delete lecture
router
  .route("/deleteCourse/:id").delete(isAuthenticated,authorizedAdmin,  deleteCourse);
router
  .route("/deleteLecture").delete(isAuthenticated,authorizedAdmin,  deleteLecture);

export default router;
