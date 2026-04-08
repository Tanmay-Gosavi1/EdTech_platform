const express= require('express');
const educatorRouter= express.Router();
const {authMiddleware, protectEducator}= require('../middlewares/authMiddleware.js');
const {
	updateRoleToEducator,
	addCourse,
	getEducatorCourses,
	getEducatorCourseById,
	updateCourse,
	getEnrolledStudentsData,
	educatorDashboardData,
	deleteCourse,
}= require('../controllers/educatorController.js');
const upload = require('../middlewares/multer').upload;

// Route to update user role to educator
educatorRouter.post('/update-role', authMiddleware, updateRoleToEducator);
educatorRouter.post('/add-course', authMiddleware, protectEducator, upload.single('image'), addCourse);
educatorRouter.get('/courses', authMiddleware, protectEducator, getEducatorCourses);
educatorRouter.get('/courses/:courseId', authMiddleware, protectEducator, getEducatorCourseById);
educatorRouter.put('/courses/:courseId', authMiddleware, protectEducator, upload.single('image'), updateCourse);
educatorRouter.get('/dashboard', authMiddleware, protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', authMiddleware, protectEducator, getEnrolledStudentsData);
educatorRouter.delete('/courses/:CourseId', authMiddleware, protectEducator, deleteCourse);

module.exports= educatorRouter;