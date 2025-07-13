# 🚀 SmartPlan - AI-Powered Daily Planner & Productivity Assistant

A modern, intelligent task management and productivity application that combines AI-powered task creation, smart scheduling, and comprehensive data persistence to help you stay organized and productive.

![SmartPlan Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%2018-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-orange)
![Firebase](https://img.shields.io/badge/Auth-Firebase%20Auth-yellow)
![AI](https://img.shields.io/badge/AI-Natural%20Language%20Processing-purple)

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [AI Task Creation](#-ai-task-creation)
- [Data Persistence](#-data-persistence)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🧠 AI-Powered Task Management
- **Natural Language Processing**: Create tasks using everyday language
- **Automatic Date/Time Extraction**: AI extracts scheduling information from text
- **Smart Scheduling**: Automatically schedules tasks with optimal timing
- **Intelligent Categorization**: AI categorizes tasks based on content
- **Priority Detection**: Automatically detects urgent vs. regular tasks

### 📅 Smart Calendar & Scheduling
- **Interactive Calendar**: Visual calendar with drag-and-drop events
- **Event Management**: Create, edit, and manage calendar events
- **Smart Reminders**: Automatic notifications 30 minutes before tasks
- **Conflict Detection**: Identifies scheduling conflicts
- **Recurring Events**: Support for daily, weekly, monthly events

### 📊 Analytics & Productivity Tracking
- **Real-time Analytics**: Track productivity metrics and trends
- **Progress Visualization**: Charts and graphs for task completion
- **Performance Insights**: AI-powered productivity recommendations
- **Goal Tracking**: Monitor progress towards productivity goals
- **Streak Tracking**: Maintain productivity streaks

### 🔔 Intelligent Notifications
- **Push Notifications**: Browser-based push notifications
- **Email Reminders**: Configurable email notifications
- **Smart Timing**: Notifications sent at optimal times
- **Customizable Settings**: Control notification preferences
- **Multi-channel Alerts**: Browser, email, and in-app notifications

### 💾 Data Persistence & Sync
- **Local Storage**: All data persists across browser sessions
- **User-specific Data**: Isolated data per user account
- **Automatic Backup**: Data automatically saved locally
- **Migration Support**: Handles data format changes gracefully
- **Offline Capability**: Works without internet connection

### 🔐 Authentication & Security
- **Firebase Authentication**: Secure user authentication
- **Google Sign-in**: One-click Google account integration
- **User Profiles**: Personalized user experience
- **Data Privacy**: User data isolated and secure
- **Session Management**: Automatic session handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for authentication)
- Hugging Face API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/smartplan.git
cd smartplan
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Backend (.env)
PORT=5000
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FCM_VAPID_KEY=your_vapid_key
```

4. **Start the application**
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ⚙️ Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a web app and copy configuration
4. Enable Cloud Messaging for push notifications

### Hugging Face AI Setup
1. Create account at [Hugging Face](https://huggingface.co/)
2. Generate API key from settings
3. Add API key to backend environment variables

### Environment Variables Reference

#### Backend (.env)
```env
PORT=5000
HUGGINGFACE_API_KEY=your_api_key
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FCM_VAPID_KEY=your_vapid_key
```

## 📖 Usage Guide

### Getting Started

1. **Sign Up/Login**
   - Visit http://localhost:3000
   - Click "Sign in with Google" or create account
   - Complete profile setup

2. **Create Your First Task**
   - Go to Dashboard
   - Use AI Task Creator: "Call client tomorrow at 3pm"
   - Or manually add tasks in Task Management

3. **Set Up Notifications**
   - Go to Notifications page
   - Click "Enable Push Notifications"
   - Allow browser permissions

### AI Task Creation

The AI understands natural language and automatically:
- Extracts dates and times
- Schedules tasks appropriately
- Sets reminders
- Categorizes and prioritizes

#### Examples:
```
✅ "Call John tomorrow at 3pm"
✅ "Review documents by Friday 2:30pm"
✅ "Team meeting next Tuesday morning"
✅ "Submit report by January 20th"
✅ "Client presentation at 10am today"
```

### Calendar Management

1. **Add Events**
   - Click "+" in calendar
   - Fill event details
   - Set date/time
   - Add location/description

2. **Edit Events**
   - Click on event
   - Modify details
   - Save changes

3. **Delete Events**
   - Click event
   - Select delete option

### Task Management

1. **Create Tasks**
   - Use AI Task Creator for natural language
   - Or manually add in Task List
   - Set priority and category

2. **Organize Tasks**
   - Filter by status (all, active, completed)
   - Sort by date, priority, name
   - Use categories for organization

3. **Track Progress**
   - Mark tasks as complete
   - View productivity analytics
   - Monitor completion rates

### Notifications

1. **Enable Push Notifications**
   - Go to Notifications page
   - Click "Enable Push Notifications"
   - Allow browser permissions

2. **Send Test Notifications**
   - Use notification form
   - Set title and message
   - Click "Send Notification"

3. **Configure Settings**
   - Toggle email notifications
   - Set push notification preferences
   - Configure reminder timing

## 🤖 AI Task Creation

### How It Works

The AI analyzes your natural language input and:

1. **Extracts Information**
   - Task title and description
   - Date and time references
   - Priority indicators
   - Category hints

2. **Processes Scheduling**
   - Converts relative dates (tomorrow, next week)
   - Parses specific times (3pm, 2:30pm)
   - Handles time periods (morning, afternoon)

3. **Creates Smart Task**
   - Schedules at appropriate time
   - Sets automatic reminders
   - Categorizes and prioritizes
   - Estimates completion time

### Supported Formats

#### Dates
- **Specific:** "January 15th", "15/01/2024", "Jan 20"
- **Relative:** "tomorrow", "next week", "next month"
- **Formats:** DD/MM/YYYY, MM/DD/YYYY, Month Day

#### Times
- **12-hour:** "3pm", "3:30pm", "3:30 PM"
- **24-hour:** "15:30", "15:30"
- **Periods:** "morning", "afternoon", "evening"

#### Combined
- "Meeting tomorrow at 2pm"
- "Call client on Friday 3:30pm"
- "Submit report by January 15th at 5pm"

### AI Analysis Features

- **Automatic Categorization:** Work, personal, meetings, deadlines
- **Priority Detection:** High (urgent), medium (normal), low (optional)
- **Time Estimation:** Based on task complexity and keywords
- **Smart Scheduling:** Respects work hours and availability

## 💾 Data Persistence

### Local Storage System

All user data is automatically saved to localStorage:
- **Tasks:** Complete task history with scheduling
- **Events:** Calendar events and appointments
- **Notifications:** Notification history and settings
- **Profile:** User preferences and settings
- **Analytics:** Productivity data and statistics

### Data Migration

The system includes automatic data migration:
- **Version Control:** Handles data format changes
- **Backward Compatibility:** Preserves existing data
- **Error Recovery:** Graceful handling of corrupted data
- **Default Values:** Fallback for missing data

### User Data Isolation

- **User-specific Keys:** Data stored per user ID
- **Secure Isolation:** No cross-user data access
- **Cleanup on Logout:** Automatic data clearing
- **Privacy Protection:** Local storage only

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile
```

### Task Management

```
GET    /api/tasks          # Get all tasks
POST   /api/tasks          # Create new task
PUT    /api/tasks/:id      # Update task
DELETE /api/tasks/:id      # Delete task
GET    /api/tasks/analytics # Get task analytics
```

### AI Services

```
POST /api/ai/parse-task           # Parse natural language task
POST /api/ai/suggest-schedule     # Get scheduling suggestions
POST /api/ai/analyze-productivity # Analyze productivity patterns
POST /api/ai/schedule-notification # Schedule automatic notification
```

### Calendar Management

```
GET    /api/calendar/events    # Get all events
POST   /api/calendar/events    # Create new event
PUT    /api/calendar/events/:id # Update event
DELETE /api/calendar/events/:id # Delete event
```

### Notifications

```
GET    /api/notifications          # Get notifications
POST   /api/notifications/send     # Send notification
POST   /api/notifications/schedule # Schedule notification
POST   /api/notifications/token    # Register FCM token
```

## 🏗️ Architecture

### Frontend (React)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── firebase/           # Firebase configuration
│   └── theme.js            # Material-UI theme
```

### Backend (Node.js/Express)
```
backend/
├── routes/                 # API route handlers
├── middleware/             # Custom middleware
├── services/              # Business logic
└── index.js               # Server entry point
```

### Key Technologies

- **Frontend:** React 18, Material-UI, Framer Motion
- **Backend:** Node.js, Express, Axios
- **Authentication:** Firebase Auth
- **AI:** Hugging Face API
- **Storage:** localStorage, Firebase
- **Notifications:** Firebase Cloud Messaging

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make changes and test**
```bash
npm test
npm run build
```

4. **Commit changes**
```bash
git commit -m 'Add amazing feature'
```

5. **Push to branch**
```bash
git push origin feature/amazing-feature
```

6. **Create Pull Request**

### Code Style

- **JavaScript:** ES6+ with async/await
- **React:** Functional components with hooks
- **CSS:** Material-UI styling system
- **API:** RESTful design patterns

### Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** for beautiful components
- **Firebase** for authentication and notifications
- **Hugging Face** for AI capabilities
- **Framer Motion** for smooth animations
- **React Community** for excellent documentation

## 📞 Support

- **Documentation:** [AI Task Creation](frontend/AI_TASK_CREATION.md)
- **Data Persistence:** [Data Persistence Guide](frontend/DATA_PERSISTENCE.md)
- **Issues:** [GitHub Issues](https://github.com/your-username/smartplan/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/smartplan/discussions)

---

**Made with ❤️ by the SmartPlan Team**

*Transform your productivity with AI-powered task management!* 