const Stripe= require('stripe');
const Course= require('../models/Course.js');
const Purchase = require('../models/Purchase.js');
const User= require('../models/User.js');
const CourseProgress= require('../models/CourseProgress.js');

// get User Data
const getUserData= async (req, res)=>{
    try{
        const userId= req.userId;

        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }
        return res.status(200).json({success: true, user, message: "User data fetched successfully"});
    }catch(error){
        console.log("Error fetching user data:", error);
        return res.status(500).json({success: false, message: "Server error fetching user data"});
    }
}

// Users enrolled Courses with lecture Links
const userEnrolledCourses= async (req, res)=>{
    try{
        const userId= req.userId;
        const userData= await User.findById(userId).populate('enrolledCourses');

        return res.json({success: true, enrolledCourses: userData.enrolledCourses, message:"User enrolled courses fetched successfully"});
    }catch(error){
        console.log("Error fetching user data:", error);
        return res.status(500).json({success: false, message: "Server error fetching enrolled courses"});
    }
}

const purchaseCourse= async (req, res)=>{
    try{
        const {courseId}= req.body;
        const origin= process.env.CLIENT_URL;

        const userId= req.userId;
        const userData= await User.findById(userId);

        const courseData= await Course.findById(courseId);
        
        if(!courseData || !userData){
            return res.status(404).json({success: false, message: "Data not found"});
        }
        
        const alreadyPurchased= await Purchase.findOne({userId, courseId, status: { $in: ['pending', 'completed'] }});
        if(alreadyPurchased){
            return res.status(400).json({success: false, message: "Course already purchased"});
        }
        
        const discountedAmount =courseData.coursePrice -(courseData.coursePrice * courseData.discount) / 100;

        const purchaseData = {
            courseId: courseData._id,
            userId: userData._id,
            amount: Math.round(discountedAmount * 100)
        }

        const newPurchase= await Purchase.create(purchaseData);

        //Stripe gateway Initialization
        const stripeInstance= new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency= process.env.CURRENCY.toLowerCase();


        //Creating line items for stripe
        const line_items= [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: newPurchase.amount
            },
            quantity: 1,
        }]

        const session= await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&purchaseId=${newPurchase._id}`,
            cancel_url: `${origin}/verify?success=false&purchaseId=${newPurchase._id}`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        console.log(session.metadata);
        return res.status(200).json({success: true, session_url: session.url});
    }catch(error){
        return res.status(500).json({success: false, message: "Server error during course purchase"});
    }
}

const verifyStripePayment= async (req, res)=>{
    try{
        const {success, purchaseId}= req.body;
        const userId = req.userId;

        if (!purchaseId) {
            return res.status(400).json({ success: false, message: "Missing purchase id" });
        }

        const purchaseRecord = await Purchase.findById(purchaseId);
        if (!purchaseRecord) {
            return res.status(404).json({ success: false, message: "Purchase not found" });
        }

        if (purchaseRecord.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized purchase verification" });
        }

        if(success === "true"){
            const purchaseData= await Purchase.findByIdAndUpdate(purchaseId,{status: 'completed'});
            if (!purchaseData) {
                return res.status(404).json({ success: false, message: "Purchase not found" });
            }

            const userData= await User.findById(purchaseData.userId);
            const courseData= await Course.findById(purchaseData.courseId);
            
            //Enroll user to the course
            if (!courseData.enrolledStudents.includes(userData._id)) {
                courseData.enrolledStudents.push(userData._id);
                await courseData.save();
            }

            if (!userData.enrolledCourses.includes(courseData._id)) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
            }
            
            return res.status(200).json({success: true, message: "Payment verified and order placed successfully"});
        }else{
            await Purchase.findByIdAndUpdate(purchaseId, {status: 'failed'});
            return res.status(200).json({success: false, message: "Payment failed, order cancelled"})
        }
    }catch(error){
        console.log("Verify Stripe Payment Error: ", error.message);
        return res.status(500).json({success: false, message: "Verifying payment failed", error: error.message});   
    }
}

// Update user course Progress
const updateUserCourseProgress= async (req, res)=>{
    const userId= req.userId;
    const {courseId, lectureId}= req.body;

    if(!courseId || !lectureId){
        return res.status(400).json({success: false, message: "Invalid data for updating course progress"});
    }

    try{
        const progressData= await CourseProgress.findOne({userId, courseId});
        
        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.status(200).json({success: true, message: "Lecture already marked as completed"});
            }
            
            progressData.lectureCompleted.push(lectureId);
            await progressData.save();
        }else{
            await CourseProgress.create({
                userId, courseId, lectureCompleted: [lectureId]
            });
        }
        return res.status(200).json({success: true, message: "Course progress created and lecture marked as completed"});
    }catch(error){
        console.log("Error updating course progress:", error);
        return res.status(500).json({success: false, message: "Server error updating course progress"});
    }
}

// Update User Course Progress
const getUserCourseProgress= async (req, res)=>{
    const userId= req.userId;
    const {courseId}= req.body;

    try{
        const progressData= await CourseProgress.findOne({userId, courseId});
        // if(!progressData){
        //     return res.status(404).json({success: false, message: "Course progress not found"});
        // }
        return res.status(200).json({success: true, progressData, message: "Course progress fetched successfully"});
    }catch(error){
        console.log("Error fetching course progress:", error);
        return res.status(500).json({success: false, message: "Server error fetching course progress"});
    }
}

//Add User Ratings to Course

const addUserRating= async (req, res)=>{
    const userId= req.userId;
    const {courseId, rating}= req.body;

    if(!courseId || !rating || !userId || rating < 1 || rating > 5){
        return res.status(400).json({success: false, message: "Invalid data for adding rating"});
    }
    try{
        const courseData= await Course.findById(courseId);
        if(!courseData){
            return res.status(404).json({success: false, message: "Course not found"});
        }
        
        //Check if user has already rated
        const user= await User.findById(userId);
        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.status(403).json({success: false, message: "User not enrolled in the course"});
        }
        const existingRatingIndex= courseData.courseRatings.findIndex(r=> r.userId.toString() === userId);

        if(existingRatingIndex >-1){
            courseData.courseRatings[existingRatingIndex].rating= rating;
        }else{
            courseData.courseRatings.push({userId, rating});
        }
        await courseData.save();
        return res.status(200).json({success: true, message: "Rating added/updated successfully"});
    }catch(error){
        console.log("Error adding/updating rating:", error);
        return res.status(500).json({success: false, message: "Server error adding/updating rating"});
    }
}

module.exports= {getUserData, userEnrolledCourses, purchaseCourse, verifyStripePayment, updateUserCourseProgress, getUserCourseProgress, addUserRating};