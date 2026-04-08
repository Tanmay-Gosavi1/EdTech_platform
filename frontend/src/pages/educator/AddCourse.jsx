import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import uniqid from 'uniqid'
import Quill from 'quill'
import axios from 'axios'
import { toast } from 'react-toastify'

import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import Modal from '../../components/common/Modal.jsx'
import { getYoutubeVideoId } from '../../utils/youtube.js'

const blankLecture = {
  lectureTitle: '',
  lectureDuration: '',
  lectureUrl: '',
  isPreviewFree: false,
}

const AddCourse = () => {
  const { backendUrl, token } = useContext(AppContext)
  const { courseId } = useParams()
  const navigate = useNavigate()

  const isEditMode = Boolean(courseId)

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [chapters, setChapters] = useState([])
  const [discount, setDiscount] = useState(0)
  const [coursePrice, setCoursePrice] = useState(0)
  const [courseThumbnail, setCourseThumbnail] = useState(null)
  const [existingThumbnail, setExistingThumbnail] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)

  const [showChapterModal, setShowChapterModal] = useState(false)
  const [chapterModalMode, setChapterModalMode] = useState('add')
  const [activeChapterId, setActiveChapterId] = useState(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')

  const [showLectureModal, setShowLectureModal] = useState(false)
  const [lectureModalMode, setLectureModalMode] = useState('add')
  const [activeLectureId, setActiveLectureId] = useState(null)
  const [lectureDetails, setLectureDetails] = useState(blankLecture)

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      })
    }
  }, [])

  const hydrateCourseData = (course) => {
    setCourseTitle(course?.courseTitle || '')
    setCoursePrice(course?.coursePrice || 0)
    setDiscount(course?.discount || 0)
    setExistingThumbnail(course?.courseThumbnail || '')

    if (quillRef.current) {
      quillRef.current.root.innerHTML = course?.courseDescription || ''
    }

    const mappedChapters = Array.isArray(course?.courseContent)
      ? course.courseContent
          .slice()
          .sort((a, b) => Number(a.chapterOrder || 0) - Number(b.chapterOrder || 0))
          .map((chapter, chapterIndex) => ({
            chapterId: chapter?.chapterId || uniqid(),
            chapterOrder: chapter?.chapterOrder || chapterIndex + 1,
            chapterTitle: chapter?.chapterTitle || `Chapter ${chapterIndex + 1}`,
            collapsed: false,
            chapterContent: Array.isArray(chapter?.chapterContent)
              ? chapter.chapterContent
                  .slice()
                  .sort((a, b) => Number(a.lectureOrder || 0) - Number(b.lectureOrder || 0))
                  .map((lecture, lectureIndex) => ({
                    lectureId: lecture?.lectureId || uniqid(),
                    lectureTitle: lecture?.lectureTitle || '',
                    lectureDuration: Number(lecture?.lectureDuration || 0),
                    lectureUrl: lecture?.lectureUrl || '',
                    isPreviewFree: Boolean(lecture?.isPreviewFree),
                    lectureOrder: lecture?.lectureOrder || lectureIndex + 1,
                  }))
              : [],
          }))
      : []

    setChapters(mappedChapters)
  }

  const fetchCourseForEdit = useCallback(async () => {
    if (!isEditMode) return

    try {
      setIsLoadingCourse(true)
      const response = await axios.get(`${backendUrl}/api/educator/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        hydrateCourseData(response.data.course)
      } else {
        toast.error(response.data.message || 'Unable to load course')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoadingCourse(false)
    }
  }, [backendUrl, courseId, isEditMode, token])

  useEffect(() => {
    if (token && isEditMode) {
      fetchCourseForEdit()
    }
  }, [token, isEditMode, fetchCourseForEdit])

  const reOrderChapters = (list) =>
    list.map((chapter, index) => ({
      ...chapter,
      chapterOrder: index + 1,
      chapterContent: chapter.chapterContent.map((lecture, lectureIndex) => ({
        ...lecture,
        lectureOrder: lectureIndex + 1,
      })),
    }))

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      setChapterModalMode('add')
      setActiveChapterId(null)
      setNewChapterTitle('')
      setShowChapterModal(true)
      return
    }

    if (action === 'edit') {
      const chapter = chapters.find((item) => item.chapterId === chapterId)
      if (!chapter) return
      setChapterModalMode('edit')
      setActiveChapterId(chapterId)
      setNewChapterTitle(chapter.chapterTitle)
      setShowChapterModal(true)
      return
    }

    if (action === 'remove') {
      const next = reOrderChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId))
      setChapters(next)
      return
    }

    if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    }
  }

  const saveChapter = () => {
    const title = newChapterTitle.trim()
    if (!title) {
      toast.error('Please enter a chapter name')
      return
    }
    if (title.length < 3) {
      toast.error('Chapter title must be at least 3 characters')
      return
    }

    if (chapterModalMode === 'add') {
      const next = reOrderChapters([
        ...chapters,
        {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterOrder: chapters.length + 1,
          chapterContent: [],
          collapsed: false,
        },
      ])
      setChapters(next)
    } else {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === activeChapterId
            ? { ...chapter, chapterTitle: title }
            : chapter
        )
      )
    }

    setShowChapterModal(false)
    setActiveChapterId(null)
    setNewChapterTitle('')
  }

  const openLectureModal = (mode, chapterId, lecture = null) => {
    setLectureModalMode(mode)
    setActiveChapterId(chapterId)

    if (mode === 'edit' && lecture) {
      setActiveLectureId(lecture.lectureId)
      setLectureDetails({
        lectureTitle: lecture.lectureTitle || '',
        lectureDuration: String(lecture.lectureDuration || ''),
        lectureUrl: lecture.lectureUrl || '',
        isPreviewFree: Boolean(lecture.isPreviewFree),
      })
    } else {
      setActiveLectureId(null)
      setLectureDetails(blankLecture)
    }

    setShowLectureModal(true)
  }

  const removeLecture = (chapterId, lectureId) => {
    const next = chapters.map((chapter) => {
      if (chapter.chapterId !== chapterId) return chapter
      return {
        ...chapter,
        chapterContent: chapter.chapterContent
          .filter((lecture) => lecture.lectureId !== lectureId)
          .map((lecture, index) => ({ ...lecture, lectureOrder: index + 1 })),
      }
    })
    setChapters(next)
  }

  const saveLecture = () => {
    const lectureTitle = lectureDetails.lectureTitle.trim()
    const lectureDuration = Number(lectureDetails.lectureDuration)
    const lectureUrl = lectureDetails.lectureUrl.trim()

    if (!lectureTitle || !lectureDuration || !lectureUrl) {
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

    const updated = chapters.map((chapter) => {
      if (chapter.chapterId !== activeChapterId) return chapter

      if (lectureModalMode === 'add') {
        const lecture = {
          lectureId: uniqid(),
          lectureTitle,
          lectureDuration,
          lectureUrl,
          isPreviewFree: Boolean(lectureDetails.isPreviewFree),
          lectureOrder: chapter.chapterContent.length + 1,
        }
        return {
          ...chapter,
          chapterContent: [...chapter.chapterContent, lecture],
        }
      }

      return {
        ...chapter,
        chapterContent: chapter.chapterContent.map((lecture) =>
          lecture.lectureId === activeLectureId
            ? {
                ...lecture,
                lectureTitle,
                lectureDuration,
                lectureUrl,
                isPreviewFree: Boolean(lectureDetails.isPreviewFree),
              }
            : lecture
        ),
      }
    })

    setChapters(updated)
    setShowLectureModal(false)
    setActiveLectureId(null)
    setLectureDetails(blankLecture)
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

    if (!isEditMode && !courseThumbnail) {
      toast.error('Please upload course thumbnail')
      return false
    }

    if (courseThumbnail && !courseThumbnail.type.startsWith('image/')) {
      toast.error('Thumbnail must be an image file')
      return false
    }

    if (courseThumbnail && courseThumbnail.size > 2 * 1024 * 1024) {
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

  const resetCreateState = () => {
    setCoursePrice(0)
    setCourseTitle('')
    setDiscount(0)
    setChapters([])
    if (quillRef.current) {
      quillRef.current.root.innerHTML = ''
    }
    setCourseThumbnail(null)
    setExistingThumbnail('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!validateCourseForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const courseData = {
        courseTitle: courseTitle.trim(),
        courseDescription: quillRef.current?.root?.innerHTML || '',
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: reOrderChapters(chapters).map((chapter) => ({
          chapterId: chapter.chapterId,
          chapterTitle: chapter.chapterTitle,
          chapterOrder: chapter.chapterOrder,
          chapterContent: chapter.chapterContent.map((lecture) => ({
            lectureId: lecture.lectureId,
            lectureTitle: lecture.lectureTitle,
            lectureDuration: Number(lecture.lectureDuration),
            lectureUrl: lecture.lectureUrl,
            isPreviewFree: Boolean(lecture.isPreviewFree),
            lectureOrder: lecture.lectureOrder,
          })),
        })),
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))
      if (courseThumbnail) {
        formData.append('image', courseThumbnail)
      }

      const requestUrl = isEditMode
        ? `${backendUrl}/api/educator/courses/${courseId}`
        : `${backendUrl}/api/educator/add-course`

      const response = isEditMode
        ? await axios.put(requestUrl, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          })
        : await axios.post(requestUrl, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          })

      if (response.data.success) {
        toast.success(response.data.message)

        if (isEditMode) {
          navigate('/educator/my-courses')
        } else {
          resetCreateState()
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-8'>
      <form
        onSubmit={handleSubmit}
        className='max-w-5xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6'
      >
        <div className='border-b border-slate-200 pb-4 sm:pb-5'>
          <h1 className='text-xl sm:text-2xl font-bold text-slate-900'>
            {isEditMode ? 'Update Course' : 'Create a New Course'}
          </h1>
          <p className='text-sm sm:text-base text-slate-600 mt-1'>
            {isEditMode
              ? 'Update lectures, chapter structure, and pricing without leaving this page.'
              : 'Add strong details to make your course discoverable and learner-ready.'}
          </p>
        </div>

        {isLoadingCourse && (
          <div className='rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700'>
            Loading existing course details...
          </div>
        )}

        <div>
          <p className='font-semibold text-gray-700 mb-1'>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here'
            maxLength={120}
            className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <p className='text-xs text-slate-500 mt-1'>{courseTitle.trim().length}/120 characters</p>
        </div>

        <div>
          <p className='font-semibold text-gray-700 mb-2'>Course Description</p>
          <div ref={editorRef} className='bg-white border border-gray-300 rounded-lg min-h-37.5' />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <p className='font-semibold text-gray-700 mb-1'>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              min={1}
              step='0.01'
              placeholder='0'
              className='w-full border border-gray-300 rounded-lg px-4 py-2'
            />
          </div>

          <div>
            <p className='font-semibold text-gray-700 mb-1'>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-4 cursor-pointer'>
              <img src={assets.file_upload_icon} alt='upload icon' className='w-10 h-10' />

              <input
                type='file'
                id='thumbnailImage'
                accept='image/*'
                hidden
                onChange={(e) => setCourseThumbnail(e.target.files?.[0] || null)}
              />

              {(courseThumbnail || existingThumbnail) && (
                <img
                  src={courseThumbnail ? URL.createObjectURL(courseThumbnail) : existingThumbnail}
                  alt='Course thumbnail preview'
                  className='w-16 h-16 object-cover rounded-md border border-slate-200'
                />
              )}
            </label>
          </div>
        </div>

        <div>
          <p className='font-semibold text-gray-700 mb-1'>Discount (%)</p>
          <input
            type='number'
            min={0}
            max={100}
            placeholder='0'
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className='w-full border border-gray-300 rounded-lg px-4 py-2'
          />
        </div>

        <div className='space-y-4'>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className='border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2 min-w-0'>
                  <img
                    src={assets.dropdown_icon}
                    width={14}
                    alt='toggle chapter'
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    className='cursor-pointer'
                  />
                  <span className='font-semibold truncate'>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    {chapter.chapterContent.length} Lectures
                  </span>
                  <button
                    type='button'
                    onClick={() => handleChapter('edit', chapter.chapterId)}
                    className='rounded-md border border-sky-200 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50'
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                    className='rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50'
                  >
                    Remove
                  </button>
                </div>
              </div>

              {!chapter.collapsed && (
                <div className='mt-4 space-y-2'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lecture.lectureId}
                      className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm bg-white px-3 py-2 rounded-lg border border-slate-200'
                    >
                      <span className='truncate'>
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} min
                      </span>

                      <div className='flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => openLectureModal('edit', chapter.chapterId, lecture)}
                          className='rounded-md border border-sky-200 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50'
                        >
                          Update
                        </button>
                        <button
                          type='button'
                          onClick={() => removeLecture(chapter.chapterId, lecture.lectureId)}
                          className='rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type='button'
                    onClick={() => openLectureModal('add', chapter.chapterId)}
                    className='text-blue-600 text-sm font-semibold hover:text-blue-700'
                  >
                    + Add Lecture
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type='button'
            onClick={() => handleChapter('add')}
            className='text-blue-700 font-semibold cursor-pointer w-fit rounded-lg px-3 py-2 hover:bg-blue-50'
          >
            + Add Chapter
          </button>
        </div>

        <Modal
          isOpen={showChapterModal}
          title={chapterModalMode === 'add' ? 'Add New Chapter' : 'Update Chapter Title'}
          description='Set a chapter title before adding or updating lectures.'
          onClose={() => {
            setShowChapterModal(false)
            setNewChapterTitle('')
          }}
          actions={(
            <>
              <button
                type='button'
                onClick={() => {
                  setShowChapterModal(false)
                  setNewChapterTitle('')
                }}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={saveChapter}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700'
              >
                {chapterModalMode === 'add' ? 'Add Chapter' : 'Save Chapter'}
              </button>
            </>
          )}
        >
          <input
            type='text'
            placeholder='Enter chapter name'
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            className='w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200'
          />
        </Modal>

        <Modal
          isOpen={showLectureModal}
          title={lectureModalMode === 'add' ? 'Add Lecture' : 'Update Lecture'}
          description='Fill lecture details to attach it to the selected chapter.'
          onClose={() => setShowLectureModal(false)}
          actions={(
            <>
              <button
                type='button'
                onClick={() => setShowLectureModal(false)}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={saveLecture}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700'
              >
                {lectureModalMode === 'add' ? 'Add Lecture' : 'Save Lecture'}
              </button>
            </>
          )}
        >
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Lecture Title'
              value={lectureDetails.lectureTitle}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureTitle: e.target.value,
                })
              }
              className='w-full rounded-lg border border-slate-300 px-4 py-2'
            />

            <input
              type='number'
              placeholder='Duration (minutes)'
              value={lectureDetails.lectureDuration}
              min={1}
              max={600}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureDuration: e.target.value,
                })
              }
              className='w-full rounded-lg border border-slate-300 px-4 py-2'
            />

            <input
              type='text'
              placeholder='Lecture URL'
              value={lectureDetails.lectureUrl}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureUrl: e.target.value,
                })
              }
              className='w-full rounded-lg border border-slate-300 px-4 py-2'
            />

            <label className='flex items-center gap-2 text-sm text-slate-700'>
              <input
                type='checkbox'
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
          type='submit'
          disabled={isSubmitting || isLoadingCourse}
          className={`w-full text-white font-semibold py-3 rounded-lg transition-colors ${
            isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (isEditMode ? 'Updating...' : 'Publishing...') : isEditMode ? 'Update Course' : 'Publish Course'}
        </button>
      </form>
    </div>
  )
}

export default AddCourse
