const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User.js');
const Course = require('../models/Course.js');

const geminiClient = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const askCourseDoubt = async (req, res) => {
    try {
        const { prompt, courseId } = req.body;
        const userId = req.userId;

        if (!geminiClient) {
            return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured' });
        }

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        if (prompt.trim().length > 2000) {
            return res.status(400).json({ success: false, message: 'Prompt is too long. Keep it under 2000 characters.' });
        }

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'Valid courseId is required' });
        }

        const [user, course] = await Promise.all([
            User.findById(userId).select('enrolledCourses name'),
            Course.findById(courseId).select('courseTitle courseDescription courseContent isPublished'),
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!course || !course.isPublished) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const isEnrolled = user.enrolledCourses.some((id) => String(id) === String(courseId));
        if (!isEnrolled) {
            return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
        }

        const chapterTitles = Array.isArray(course.courseContent)
            ? course.courseContent.slice(0, 20).map((chapter) => chapter.chapterTitle).filter(Boolean)
            : [];

        const lectureTranscriptSnippets = [];
        if (Array.isArray(course.courseContent)) {
            for (const chapter of course.courseContent.slice(0, 20)) {
                const lectures = Array.isArray(chapter?.chapterContent) ? chapter.chapterContent : [];
                for (const lecture of lectures.slice(0, 10)) {
                    const transcriptText = String(lecture?.transcriptText || '').trim();
                    if (transcriptText) {
                        lectureTranscriptSnippets.push(
                            `${lecture.lectureTitle || 'Lecture'}: ${transcriptText.slice(0, 900)}`
                        );
                    }
                }
            }
        }

        const transcriptContext = lectureTranscriptSnippets
            .join('\n\n')
            .slice(0, 6000);

        const model = geminiClient.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

        const contextualPrompt = [
            'You are an EdTech teaching assistant inside the Educaso platform.',
            'Keep answers easy to understand for students.',
            'Use bullet points when useful. If code is needed, provide short runnable examples.',
            `Student Name: ${user.name || 'Student'}`,
            `Course Title: ${course.courseTitle}`,
            `Course Description: ${String(course.courseDescription || '').replace(/<[^>]*>/g, ' ').slice(0, 1500)}`,
            `Course Chapters: ${chapterTitles.join(', ') || 'N/A'}`,
            `Lecture Transcript Context: ${transcriptContext || 'if Transcript not available for lectures then give a response based on course content.'}`,
            `Student Doubt: ${prompt.trim()}`,
        ].join('\n\n');

        const result = await model.generateContent(contextualPrompt);
        const reply = result?.response?.text?.() || 'Sorry, I could not generate a response right now.';

        return res.status(200).json({ success: true, reply });
    } catch (error) {
        console.error('AI doubt solver error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate response' });
    }
};

module.exports = { askCourseDoubt };
