const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const pythonCommand = process.env.PYTHON_BIN || 'python';
const transcriptScriptPath = path.resolve(__dirname, '..', 'get_transcript.py');

const getYoutubeVideoId = (urlOrId = '') => {
    const input = String(urlOrId || '').trim();

    if (!input) {
        return '';
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
        return input;
    }

    try {
        const parsedUrl = new URL(input);
        const host = parsedUrl.hostname.replace('www.', '').toLowerCase();

        if (host === 'youtu.be') {
            return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
        }

        if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
            if (parsedUrl.pathname === '/watch') {
                return parsedUrl.searchParams.get('v') || '';
            }

            if (parsedUrl.pathname.startsWith('/embed/')) {
                return parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || '';
            }

            if (parsedUrl.pathname.startsWith('/shorts/')) {
                return parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || '';
            }

            if (parsedUrl.pathname.startsWith('/live/')) {
                return parsedUrl.pathname.split('/live/')[1]?.split('/')[0] || '';
            }
        }

        return '';
    } catch {
        return '';
    }
};

const parsePythonTranscriptOutput = (stdout) => {
    const output = String(stdout || '').trim();
    if (!output) {
        throw new Error('Empty transcript output from Python script');
    }

    const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const lastLine = lines[lines.length - 1] || output;

    return JSON.parse(lastLine);
};

const fetchTranscriptByVideoId = async (videoId) => {
    if (!videoId) {
        return {
            success: false,
            error: 'Invalid video id',
            transcript: [],
            text: '',
            segments: 0,
            language: null,
            languageCode: null,
        };
    }

    try {
        const { stdout } = await execFileAsync(
            pythonCommand,
            [transcriptScriptPath, videoId],
            {
                windowsHide: true,
                timeout: 30000,
                maxBuffer: 10 * 1024 * 1024,
            }
        );

        const pythonResult = parsePythonTranscriptOutput(stdout);
        const transcript = Array.isArray(pythonResult?.transcript) ? pythonResult.transcript : [];
        const text = String(pythonResult?.text || '').trim();

        return {
            success: true,
            transcript,
            text,
            segments: Number(pythonResult?.segments ?? transcript.length),
            language: pythonResult?.language ?? null,
            languageCode: pythonResult?.languageCode ?? null,
        };
    } catch (error) {
        return {
            success: false,
            error: String(error?.message || error),
            transcript: [],
            text: '',
            segments: 0,
            language: null,
            languageCode: null,
        };
    }
};

const fetchTranscriptByUrl = async (urlOrId) => {
    const videoId = getYoutubeVideoId(urlOrId);
    const result = await fetchTranscriptByVideoId(videoId);

    return {
        ...result,
        videoId,
    };
};

const enrichCourseContentWithTranscripts = async (courseContent = []) => {
    if (!Array.isArray(courseContent)) {
        return [];
    }

    const enrichedChapters = [];

    for (const chapter of courseContent) {
        const chapterContent = Array.isArray(chapter?.chapterContent) ? chapter.chapterContent : [];
        const enrichedLectures = [];

        for (const lecture of chapterContent) {
            const transcriptResult = await fetchTranscriptByUrl(lecture?.lectureUrl || '');

            enrichedLectures.push({
                ...lecture,
                transcript: transcriptResult.success ? transcriptResult.transcript : [],
                transcriptText: transcriptResult.success ? transcriptResult.text : '',
                transcriptSegments: transcriptResult.success ? transcriptResult.segments : 0,
                transcriptLanguage: transcriptResult.success ? transcriptResult.language : '',
                transcriptLanguageCode: transcriptResult.success ? transcriptResult.languageCode : '',
                transcriptVideoId: transcriptResult.success ? transcriptResult.videoId : '',
            });
        }

        enrichedChapters.push({
            ...chapter,
            chapterContent: enrichedLectures,
        });
    }

    return enrichedChapters;
};

module.exports = {
    getYoutubeVideoId,
    fetchTranscriptByUrl,
    enrichCourseContentWithTranscripts,
};
