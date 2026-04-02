# GradeSync

An AI-powered Learning Management System (LMS) that connects teachers and students. Teachers upload course materials and GradeSync automatically generates summaries, flashcards, and mock quizzes using Google Gemini AI. Students enroll in courses, study with AI-generated content, and track their performance over time.

**Live:** https://gradesync-ten.vercel.app

---

## Features

### For Teachers
- Upload course materials (PDF, DOCX, TXT)
- AI auto-generates summaries, key notes, flashcards, and quizzes from uploaded content
- Post announcements to enrolled students
- View student performance insights and engagement analytics
- Manage course enrollment via unique enrollment keys

### For Students
- Enroll in courses using teacher-provided enrollment keys
- Read AI-generated summaries and key learning points
- Study with interactive AI flashcards (mark correct/incorrect)
- Take AI-generated mock tests with a countdown timer
- Track quiz and flashcard accuracy per material on the My Progress page
- Send queries directly to teachers and receive replies

### General
- Dark mode and accent color theming
- Mobile-responsive sidebar with hamburger toggle
- Toast notifications for all actions
- Skeleton loading states

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Vite |
| Styling | CSS custom properties (dark/light mode) |
| HTTP | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Google Gemini API |
| File Parsing | pdf-parse, mammoth (DOCX), multer (memory storage) |
| Deployment | Vercel (serverless) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Run Locally

**1. Start the backend**
```bash
cd server
npm install
npm start
```

**2. Start the frontend** (in a separate terminal)
```bash
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Project Structure

```
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Dashboard, Materials, Flashcards, MockTests, Progress, ...
│       ├── components/      # DashboardLayout, Sidebar
│       └── context/         # AuthContext, ThemeContext
├── server/                  # Express backend
│   ├── models/              # Mongoose schemas (User, Material, Performance, ...)
│   ├── routes/              # API route handlers
│   ├── middleware/          # JWT auth middleware
│   └── utils/               # Gemini AI helpers
├── api/
│   └── index.js             # Vercel serverless entry point
└── vercel.json              # Vercel deployment config
```

---

## Deployment (Vercel)

The app is configured for Vercel serverless deployment via `vercel.json`. The Express server is wrapped as a single serverless function at `api/index.js`.

```bash
# Deploy via Vercel CLI
npx vercel --prod
```

Make sure all environment variables are set in the Vercel project settings.

---

## License

MIT
