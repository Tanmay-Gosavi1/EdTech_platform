import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../../assets/assets'
import uniqid from 'uniqid'
import Quill from 'quill'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import {toast} from 'react-toastify'
import axios from 'axios'
import Modal from '../../components/common/Modal.jsx'
import { getYoutubeVideoId } from '../../utils/youtube.js'

const AddCourse = () => {

  const {backendUrl, token}= useContext(AppContext);
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [chapters, setChapters] = useState([])
  const [discount, setDiscount] = useState(0)
  const [coursePrice, setCoursePrice] = useState(0)
  const [courseThumbnail, setCourseThumbnail] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })


  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      })
    }
  }, [])


  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      setShowChapterModal(true)
    } else if (action === 'remove') {
      setChapters(
        chapters.filter(
          (chapter) => chapter.chapterId !== chapterId
        )
      )
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    }
  }


  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setShowPopup(true)
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            return {
              ...chapter,
              chapterContent: chapter.chapterContent.filter((_, idx) => idx !== lectureIndex),
            }
          }
          return chapter
        })
      )
    }
  }

  const addChapter = () => {
    const title = newChapterTitle.trim()
    if (!title) {
      toast.error('Please enter a chapter name')
      return
    }
    if (title.length < 3) {
      toast.error('Chapter title must be at least 3 characters')
      return
    }

    const newChapter = {
      chapterId: uniqid(),
      chapterTitle: title,
      chapterContent: [],
      collapsed: false,
      chapterOrder:
        chapters.length > 0
          ? chapters.slice(-1)[0].chapterOrder + 1
          : 1,
    }

    setChapters([...chapters, newChapter])
    setNewChapterTitle('')
    setShowChapterModal(false)
  }


  const addLecture = () => {
    const lectureTitle = lectureDetails.lectureTitle.trim()
    const lectureDuration = Number(lectureDetails.lectureDuration)
    const lectureUrl = lectureDetails.lectureUrl.trim()

    if(!lectureTitle || !lectureDuration || !lectureUrl){
      toast.error('Please fill all lecture fields')
      return
    }

    if (lectureTitle.length < 3) {
      toast.error('Lecture title must be at least 3 characters')
      return
    }

    if (!Number.isFinite(lectureDuration) || lectureDuration <= 0 || lectureDuration > 600) {
      toast.error('Lecture duration must be between 1 and 600 minutes')
      return
    }

    if (!getYoutubeVideoId(lectureUrl)) {
      toast.error('Please enter a valid YouTube URL for lecture')
      return
    }

    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureTitle,
            lectureUrl,
            lectureDuration,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          }
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          }
        }
        return chapter
      })
    )

    setShowPopup(false)

    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
  }

  const validateCourseForm = () => {
    const trimmedTitle = courseTitle.trim()
    const plainDescription = quillRef.current?.getText().trim() || ''
    const parsedPrice = Number(coursePrice)
    const parsedDiscount = Number(discount)

    if (trimmedTitle.length < 5) {
      toast.error('Course title must be at least 5 characters long')
      return false
    }

    if (plainDescription.length < 20) {
      toast.error('Course description must be at least 20 characters long')
      return false
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error('Course price must be greater than 0')
      return false
    }

    if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      toast.error('Discount must be between 0 and 100')
      return false
    }

    if (!courseThumbnail) {
      toast.error('Please upload course thumbnail')
      return false
    }

    if (!courseThumbnail.type.startsWith('image/')) {
      toast.error('Thumbnail must be an image file')
      return false
    }

    if (courseThumbnail.size > 2 * 1024 * 1024) {
      toast.error('Thumbnail size should be less than 2MB')
      return false
    }

    if (chapters.length === 0) {
      toast.error('Please add at least one chapter')
      return false
    }

    const emptyChapter = chapters.find((chapter) => chapter.chapterContent.length === 0)
    if (emptyChapter) {
      toast.error('Each chapter must contain at least one lecture')
      return false
    }

    return true
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!validateCourseForm()) {
      return
    }

    try{
      setIsSubmitting(true)
      const courseData= {
        courseTitle: courseTitle.trim(),
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      }

      const formData= new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', courseThumbnail);

      const response= await axios.post(backendUrl + '/api/educator/add-course', formData, {headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data'}});

      if(response.data.success){
        toast.success(response.data.message);
        setCoursePrice(0);
        setCourseTitle('');
        setDiscount(0);
        setChapters([]);
        quillRef.current.root.innerHTML= '';
        setCourseThumbnail(null);
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      toast.error(error.message);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-8"
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6"
      >

        <div className='border-b border-slate-200 pb-4 sm:pb-5'>
          <h1 className='text-xl sm:text-2xl font-bold text-slate-900'>Create a New Course</h1>
          <p className='text-sm sm:text-base text-slate-600 mt-1'>Add strong details to make your course discoverable and learner-ready.</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">
            Course Title
          </p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Type here"
            maxLength={120}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className='text-xs text-slate-500 mt-1'>{courseTitle.trim().length}/120 characters</p>
        </div>


        <div>
          <p className="font-semibold text-gray-700 mb-2">
            Course Description
          </p>
          <div
            ref={editorRef}
            className="bg-white border border-gray-300 rounded-lg min-h-37.5"
          />
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Course Price
            </p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              min={1}
              step="0.01"
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>


          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Course Thumbnail
            </p>
            <label
              htmlFor="thumbnailImage"
              className="flex items-center gap-4 cursor-pointer"
            >
              <img
                src={assets.file_upload_icon}
                alt="upload icon"
                className="w-10 h-10"
              />

              <input
                type="file"
                id="thumbnailImage"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setCourseThumbnail(e.target.files[0])
                }
              />

              {courseThumbnail && (
                <img
                  src={URL.createObjectURL(courseThumbnail)}
                  alt=""
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
            </label>
          </div>

        </div>


        <div>
          <p className="font-semibold text-gray-700 mb-1">
            Discount (%)
          </p>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>


        {/* Chapters & Lectures */}
        <div className="space-y-4">

          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={assets.dropdown_icon}
                    width={14}
                    alt=""
                    onClick={() =>
                      handleChapter('toggle', chapter.chapterId)
                    }
                    className="cursor-pointer"
                  />
                  <span className="font-semibold truncate">
                    {index + 1}. {chapter.chapterTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {chapter.chapterContent.length} Lectures
                  </span>
                  <img
                    src={assets.cross_icon}
                    alt=""
                    onClick={() =>
                      handleChapter('remove', chapter.chapterId)
                    }
                    className="cursor-pointer"
                  />
                </div>

              </div>

              {!chapter.collapsed && (
                <div className="mt-4 space-y-2">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lectureIndex}
                      className="flex items-center justify-between gap-3 text-xs sm:text-sm bg-white px-3 py-2 rounded-lg border border-slate-200"
                    >
                      <span className='truncate'>
                        {lectureIndex + 1}. {lecture.lectureTitle} – {lecture.lectureDuration} min
                      </span>

                      <img
                        src={assets.cross_icon}
                        alt=""
                        className="cursor-pointer"
                        onClick={() =>
                          handleLecture(
                            'remove',
                            chapter.chapterId,
                            lectureIndex
                          )
                        }
                      />
                    </div>
                  ))}

                  <div
                    onClick={() =>
                      handleLecture('add', chapter.chapterId)
                    }
                    className="text-blue-600 cursor-pointer text-sm font-semibold"
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            onClick={() => handleChapter('add')}
            className="text-blue-700 font-semibold cursor-pointer w-fit rounded-lg px-3 py-2 hover:bg-blue-50"
          >
            + Add Chapter
          </div>

        </div>

        <Modal
          isOpen={showChapterModal}
          title="Add New Chapter"
          description="Create a chapter title before adding lectures."
          onClose={() => {
            setShowChapterModal(false)
            setNewChapterTitle('')
          }}
          actions={(
            <>
              <button
                type="button"
                onClick={() => {
                  setShowChapterModal(false)
                  setNewChapterTitle('')
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addChapter}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Add Chapter
              </button>
            </>
          )}
        >
          <input
            type="text"
            placeholder="Enter chapter name"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </Modal>

        <Modal
          isOpen={showPopup}
          title="Add Lecture"
          description="Fill lecture details to attach it to the selected chapter."
          onClose={() => setShowPopup(false)}
          actions={(
            <>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addLecture}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Add Lecture
              </button>
            </>
          )}
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Lecture Title"
              value={lectureDetails.lectureTitle}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureTitle: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={lectureDetails.lectureDuration}
              min={1}
              max={600}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureDuration: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            />

            <input
              type="text"
              placeholder="Lecture URL"
              value={lectureDetails.lectureUrl}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureUrl: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: e.target.checked,
                  })
                }
              />
              Free Preview
            </label>
          </div>
        </Modal>


        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-semibold py-3 rounded-lg transition-colors ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Course'}
        </button>

      </form>
    </div>
  )
}

export default AddCourse
