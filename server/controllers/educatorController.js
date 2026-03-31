const User= require('../models/User.js');
const Course= require('../models/Course.js');
const Purchase = require('../models/Purchase.js');
const {cloudinary} = require('../configs/cloudinary.js');

// Update user role to educator

const updateRoleToEducator= async (req, res)=>{
    try{
        const userId= req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        
        console.log("User ID from auth middleware:", userId);

        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }

        if (user.role === 'educator') {
            return res.status(200).json({
                success: true,
                message: "User is already an educator"
            });
        }

        user.role= 'educator';
        await user.save();

        return res.status(200).json({success: true, message: "User can publish courses now"});
    }catch(error){
        console.log("Error updating role to educator:", error);
        return res.status(500).json({success: false, message: "Server error updating role to educator"});
    }
}


// Add new Course function can be added here in future
const addCourse= async (req, res)=>{
    // Implementation will go here
    try{
        const {courseData}= req.body;
        const imageFile= req.file;

        if(!imageFile){
            return res.status(400).json({success: false, message: "Thumbnail not attached"});
        }
        const parsedCourseData= JSON.parse(courseData);
        parsedCourseData.educator= req.userId;
        
        const imageUpload= await cloudinary.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail= imageUpload.secure_url;

        const newCourse= await Course.create(parsedCourseData);

        await newCourse.save();
        return res.status(201).json({success: true, message: "Course added successfully"});
    }catch(error){
        console.log("Error adding new course:", error);
        return res.status(500).json({success: false, message: "Server error adding new course"});
    }
}

// get Educator Courses
const getEducatorCourses= async (req, res)=>{
    try{
        const educator= req.userId;

        const courses= await Course.find({ educator: educator });
        return res.status(200).json({success: true, courses: courses, message: "Educator courses fetched successfully"});
    }catch(error){
        console.log("Error getting educator courses:", error);
        return res.status(500).json({success: false, message: "Server error getting educator courses"});
    }
}

// get educator dashboard data function can be added here in future
const educatorDashboardData= async (req, res)=>{
    try{
        const educator= req.userId;
        const courses= await Course.find({ educator: educator });
        const totalCourses= courses.length;
        
        const courseIds= courses.map(course=> course._id);

        // calculate total earning from purchases
        const purchases= await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        });

        const totalEarning= purchases.reduce((sum, purchase)=> sum + purchase.amount, 0);

        // Collect enrolled students data
        const enrolledStudentsData= [];
        for(const course of courses){
            const students= await User.find({
                _id: {$in: course.enrolledStudents}
            },'name imageUrl');
            students.forEach(student=> {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            })
        }
        res.status(200).json({success: true, message: "Educator dashboard data fetched successfully", dashboardData: {
            totalEarning,
            totalCourses,
            enrolledStudentsData
        }})
    }catch(error){
        console.log("Error getting educator dashboard data:", error);
        return res.status(500).json({success: false, message: "Server error getting educator dashboard data"});
    }
}

const deleteCourse = async(req,res)=>{
    try {
        const {CourseId}= req.params;
        const educator= req.userId;
        const course= await Course.findOne({_id: CourseId, educator: educator});

        if(!course){
            return res.status(404).json({success: false, message: "Course not found"});
        }
        await course.deleteOne();

        const allCourses= await Course.find({ educator: educator });
        return res.status(200).json({success: true, message: "Course deleted successfully" , allCourses: allCourses});
    } catch (error) {
        return res.status(500).json({success: false, message: "Server error deleting course"});
    }
}

// Enrolled Students data with purchase data
const getEnrolledStudentsData= async (req, res)=>{
    try{
        const educator= req.userId;
        const courses= await Course.find({ educator: educator });
        
        const courseIds= courses.map(course => course._id);
        
        const purchases= await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');
        
        const enrolledStudents= purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }))

        return res.status(200).json({success: true, enrolledStudents: enrolledStudents});
    }catch(error){
        console.log("Error getting enrolled students data:", error);
        return res.status(500).json({success: false, message: "Server error getting enrolled students data"});
    }
}
module.exports= {updateRoleToEducator,   addCourse, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData, deleteCourse};