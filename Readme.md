# Educaso - Full Stack EdTech Platform

Educaso is a modern learning platform where students can discover and enroll in courses, and educators can create, manage, and track their teaching business from a dedicated dashboard.

## What You Can Do In Educaso

### Deployed URL : https://educaso-client.onrender.com


### Student Experience
- Create account and log in securely with JWT authentication.
- Explore published courses with pricing, discount, and rating information.
- Open complete course details with chapter and lecture structure.
- Purchase courses through Stripe Checkout.
- Verify payment status from a dedicated payment verification flow.
- Access enrolled courses and continue learning from the player page.
- Track lecture completion progress.
- Add or update course ratings (only when enrolled).

### Educator Experience
- Upgrade a normal user account to educator role.
- Create and publish courses with thumbnail upload via Cloudinary.
- Build structured course content (chapters + lectures).
- View all own courses with earnings and enrollment counts.
- Monitor dashboard analytics:
	- total earnings
	- total courses
	- latest enrollments
- View enrolled students data for owned courses.
- Delete course from My Courses screen (web and mobile UI).
- Ownership protection: only the educator who uploaded a course can delete it.

## Tech Stack

### Frontend
- React + Vite
- React Router
- Axios
- Tailwind CSS
- React Toastify
- Quill editor

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth + bcrypt
- Stripe payments
- Cloudinary media storage

## Project Structure

```text
Educaso/
	frontend/   # React application
	server/     # Express API + MongoDB integration
```

## Local Setup

### 1. Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas (or MongoDB connection URI)
- Cloudinary account
- Stripe account (test mode is fine)

### 2. Clone Project

```bash
git clone https://github.com/Tanmay-Gosavi1/EdTech_platform.git
cd EdTech_platform
```

### 3. Setup Backend (`server`)

```bash
cd server
npm install
```

Create a `.env` file inside `server/` and add:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CURRENCY=USD
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

Backend starts at `http://localhost:5000` by default.

### 4. Setup Frontend (`frontend`)

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` and add:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CURRENCY=USD
```

Run frontend:

```bash
npm run dev
```

Frontend starts at `http://localhost:5173`.

## Available Scripts

### Frontend
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint frontend code

### Backend
- `npm run dev` - start server with nodemon
- `npm start` - start server in normal mode

## Core API Areas

### Auth and Profile
- `POST /api/signup`
- `POST /api/login`
- `GET /api/user-info`

### Course Discovery
- `GET /api/course/all`
- `GET /api/course/:id`

### Educator APIs
- `POST /api/educator/update-role`
- `POST /api/educator/add-course`
- `GET /api/educator/courses`
- `GET /api/educator/dashboard`
- `GET /api/educator/enrolled-students`
- `DELETE /api/educator/courses/:CourseId`

### Student Learning and Payments
- `GET /api/user/data`
- `GET /api/user/enrolled-courses`
- `POST /api/user/purchase`
- `POST /api/user/verify-payment`
- `POST /api/user/update-course-progress`
- `POST /api/user/get-course-progress`
- `POST /api/user/add-rating`

## End-to-End User Journey

1. User signs up and logs in.
2. User browses courses and checks details.
3. User purchases a course using Stripe Checkout.
4. Payment is verified and enrollment is activated.
5. User learns via player and tracks lecture completion.
6. User rates enrolled courses.
7. Educator creates courses and tracks business metrics.
8. Educator can delete own uploaded courses from My Courses (web/mobile).

## Security and Access Rules
- Protected routes use JWT bearer tokens.
- Educator actions require educator role validation.
- Course deletion is ownership-scoped on the backend:
	- only the uploader educator can delete that course.

## Deployment Notes
- Frontend includes `vercel.json`, so it can be deployed on Vercel.
- Set frontend environment values (`VITE_BACKEND_URL`, `VITE_CURRENCY`) in deployment settings.
- Deploy backend separately (Render/Railway/Fly.io/VM) and update `VITE_BACKEND_URL` to production API URL.

## Author
- Tanmay Gosavi

