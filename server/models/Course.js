const mongoose= require('mongoose');

const LectureSchema= new mongoose.Schema({
    lectureId: {type: String, required: true},
    lectureTitle: {type: String, required: true},
    lectureDuration: {type: Number, required: true}, // in minutes
    lectureUrl: {type: String,required: true, default: ""},
    isPreviewFree: {type: Boolean, required: true, default: false},
    lectureOrder: {type: Number, required: true},
    transcript: [{
        text: {type: String, default: ''},
        start: {type: Number, default: 0},
        duration: {type: Number, default: 0},
    }],
    transcriptText: {type: String, default: ''},
    transcriptSegments: {type: Number, default: 0},
    transcriptLanguage: {type: String, default: ''},
    transcriptLanguageCode: {type: String, default: ''},
    transcriptVideoId: {type: String, default: ''},
},{_id: false});


const ChapterSchema= new mongoose.Schema({
    chapterId: {type: String, required: true},
    chapterOrder: {type: Number, required: true},
    chapterTitle: {type: String, required: true},
    chapterContent: [LectureSchema],
},{_id: false});

const CourseSchema= new mongoose.Schema({
    courseTitle: {type: String, required: true},
    courseDescription: {type: String, required: true},
    courseThumbnail: {type: String, required: true},
    coursePrice: {type: Number, required: true},
    isPublished: {type: Boolean, default: true},
    discount: {type: Number, required: true, min: 0, max: 100, default: 0},
    courseContent:[ChapterSchema],
    courseRatings:[{
        userId: { type: String },
        rating: {type: Number, min: 1, max: 5}
    }],
    educator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, 
    enrolledStudents:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],     
}, {timestamps: true, minimize: false});

module.exports= mongoose.models.Course || mongoose.model('Course', CourseSchema);