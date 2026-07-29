# 🎯 AgentThon

**AI-Powered Call Coaching Platform for Sales & Support Teams**

AgentThon is a modern web application designed to help organizations improve agent performance through intelligent call analysis, real-time coaching, and data-driven insights. Coaches and managers can record calls, analyze transcripts with AI assistance, track team performance, and provide personalized coaching recommendations.

## ✨ Features

- **📞 Call Management**: Record, store, and manage customer service and sales calls
- **🤖 AI Coaching**: Get instant AI-powered analysis and coaching recommendations for each call
- **📊 Analytics Dashboard**: Track key metrics and performance indicators
- **🏆 Leaderboard**: Visualize team performance rankings
- **👥 Agent Profiles**: Individual performance tracking and improvement areas
- **🔐 Secure Authentication**: User registration, login, and password recovery
- **💾 Cloud Storage**: Firebase-backed storage for calls and metadata
- **⚡ Real-time Updates**: Live performance tracking with React Query

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project credentials

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agent-thon

# Install dependencies
npm install

# Create a .env file with your Firebase credentials
# Contact admin for Firebase configuration

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Storage)
- **Data Fetching**: TanStack React Query
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Routing**: React Router v7
- **Charts**: Recharts
- **Icons**: Lucide React
- **Linting**: ESLint

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AICopilot.tsx   # AI assistant interface
│   ├── CallList.tsx    # Call management
│   ├── CallRecorder.tsx# Recording functionality
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Performance.tsx # Performance metrics
│   ├── Settings.tsx    # User settings
│   └── ...
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Analytics.tsx
│   ├── Coach.tsx
│   ├── Leaderboard.tsx
│   └── ...
├── services/           # API & Firebase integration
│   ├── firebase.ts     # Firebase config
│   └── db.ts          # Database operations
├── store/             # Global state management
│   └── useAppStore.ts # Zustand store
├── App.tsx
└── main.tsx
```

## 🔧 Development

```bash
# Start development server with hot reload
npm run dev

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔐 Firebase Setup

This project uses Firebase for:
- **Firestore**: Real-time database for calls, users, and metadata
- **Authentication**: Secure user authentication
- **Storage**: Cloud storage for call recordings
- **Security Rules**: Data validation and access control

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📧 Support

For questions or support, contact the development team.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
