# ZoneOut  
### AI-Powered Study Productivity Platform

<p align="center">
  <img src="public/logo.svg" width="120" alt="ZoneOut Logo"/>
</p>



---

## Overview

ZoneOut is a modern AI-powered productivity platform built for students.  
It combines structured study management with intelligent assistance to create a focused and distraction-free academic environment.

The application integrates course organization, task tracking, time management tools, and AI-powered features into a unified workflow.

---

## Key Features

### Authentication
- Secure login system  
- JWT-based token storage  
- Dark / Light theme toggle  
- Fully responsive layout  

### Dashboard
- Central productivity overview  
- Quick access to study tools  
- Structured layout for workflow clarity  

### Course Vault
- Organize courses and modules  
- Upload and manage study materials  
- Structured academic storage  

### Timeline
- Task and academic event tracking  
- Organized planning interface  

### Focus Timer
- Deep work session timer  
- Start / Pause / Stop functionality  
- Minimal and distraction-free interface  

### Music
- Background focus music interface  
- Clean playback controls  

### AI Assistant
- Gemini-powered integration  
- Context-aware responses  
- App navigation and timer control  
- Study assistance and content generation  

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Framer Motion
- Lucide React Icons

**AI Integration**
- Google Generative AI (Gemini)

**State Management**
- React Hooks
- Context API

**Styling**
- Custom CSS variables
- Glassmorphism-inspired UI
- Fully responsive design

---

## Project Structure

```bash
src/
│
├── components/
│   ├── Header.jsx
│   ├── Dashboard.jsx
│   ├── CourseVaultPage.jsx
│   ├── FocusTimerPage.jsx
│   ├── MusicPage.jsx
│   ├── AIPage.jsx
│   ├── Auth.jsx
│   └── ...
│
├── context/
│   └── ThemeContext.jsx
│
├── Brain.js
├── NeuralBrain.js
├── App.jsx
└── main.jsx
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/zoneout.git
cd zoneout
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_backend_url
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start Development Server

```bash
npm run dev
```

The application will start locally using Vite.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API base URL |
| VITE_GEMINI_API_KEY | Gemini AI API key (optional if using backend fallback) |

### AI when Gemini quota is exceeded

Study Buddy (think + chat) keeps working when the **frontend** Gemini quota is used up:

1. **Frontend** tries Gemini first (using `VITE_GEMINI_API_KEY`). If the call fails (e.g. 429 quota), it falls back to your **backend**.
2. **Backend** serves AI via `POST /api/ai/think` and `POST /api/ai/chat`. It uses **OpenRouter** first, then **Gemini**, so you need at least one of these set in the **server** `.env`:
   - `OPENROUTER_API_KEY` – [OpenRouter](https://openrouter.ai) (many models, often has free tier).
   - `GEMINI_API_KEY` – same as Gemini; useful if the server has its own quota.

With the backend running and at least one of these keys set, AI continues to work even when the browser’s Gemini key hits its limit. The server’s `server/.env` should include `OPENROUTER_API_KEY` and/or `GEMINI_API_KEY` for fallback.

---

## Design Philosophy

ZoneOut is designed with the following principles:

- Focus-first interaction  
- Minimal cognitive load  
- Clear visual hierarchy  
- Responsive across devices  
- AI as an assistant, not a distraction  

The interface emphasizes clarity, smooth transitions, and consistency across modules.

---

## Contribution Guidelines

When contributing:

- Do not modify AI core logic (`Brain.js`, `NeuralBrain.js`) without review.  
- Avoid altering routing logic unless necessary.  
- Maintain responsive design across devices.  
- Keep UI updates consistent with the existing theme system.  
- Ensure functionality remains unaffected by visual changes.  

---

## Planned Enhancements

- Advanced progress analytics  
- Expanded AI study automation  
- Collaborative study tools  
- Improved performance optimization  
- Production deployment configuration  

---

## License

This project is developed for educational and academic use.

---

## Maintainers

ZoneOut Development Team  
AI Productivity Platform for Students
