# CLAUDE.md - DreamSprout Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the DreamSprout frontend repository.

## Project Overview

DreamSprout Frontend is a React + TypeScript application that provides a magical interface for recording dreams and transforming them into AI-generated fairy tales with illustrations. The app features voice recording, real-time transcription, and beautiful visualizations.

## Tech Stack

- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 3.4.0
- **Authentication**: Firebase 10.12.0 (Google Sign-in + Guest mode)
- **Routing**: React Router DOM 7.7.0
- **Icons**: Lucide React 0.525.0
- **Deployment**: Railway (with Express server for production)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm start            # Start production server (after build)
```

## Environment Configuration

Create `.env` file from `.env.example`:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API URL
VITE_API_BASE_URL=http://localhost:3001/api  # Development
# VITE_API_BASE_URL=https://your-backend-url.com/api  # Production

# Feature Flags
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_IMAGE_GENERATION=true
VITE_ENABLE_ANALYTICS=false
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── Logo.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   ├── TextToSpeech.tsx
│   │   └── FloatingHelpButton.tsx
│   ├── create/          # Dream creation components
│   │   ├── CreateView.tsx
│   │   ├── DreamInput.tsx
│   │   ├── VoiceInput.tsx
│   │   ├── GenerationOptions.tsx
│   │   └── GeneratedStory.tsx
│   ├── journal/         # Dream journal components
│   │   ├── JournalView.tsx
│   │   ├── DreamCard.tsx
│   │   ├── DreamDetail.tsx
│   │   └── EmptyJournal.tsx
│   ├── settings/        # Settings components
│   │   └── SettingsView.tsx
│   ├── layout/          # Layout components
│   │   └── Header.tsx
│   ├── AuthModal.tsx    # Authentication modal
│   └── HelpModal.tsx    # Help/tutorial modal
├── contexts/
│   └── AuthContext.tsx  # Firebase auth context
├── hooks/               # Custom React hooks
│   ├── useAudioRecorder.ts
│   ├── useDreams.ts
│   └── useTextToSpeech.ts
├── services/            # API and external services
│   ├── api.ts           # Backend API client
│   └── dreamService.ts  # Dream data management
├── config/
│   └── firebase.ts      # Firebase configuration
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── constants.ts
├── App.tsx              # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Key Features Implementation

### Authentication Flow
- Firebase Auth with Google Provider
- Guest mode using localStorage
- Auth state persisted across sessions
- Seamless upgrade from guest to authenticated user

### Dream Recording
- **Text Input**: Simple textarea with character guidance
- **Voice Recording**: WebRTC MediaRecorder API
  - Audio blob stored temporarily
  - Transcribed via backend OpenAI Whisper API
  - Playback controls included

### AI Generation Options
1. **Fairy Tale Generation**
   - Customizable tone (whimsical, mystical, adventurous, etc.)
   - Length options (short, medium, long)
   - Optional AI illustrations (3 scenes)
   
2. **Dream Analysis**
   - Psychological insights
   - Symbol interpretation
   - Emotional themes

3. **Save Only**
   - Store dream without AI processing

### Data Management
- **Guest Users**: localStorage only
- **Authenticated Users**: Synced with PostgreSQL backend
- Optimistic UI updates
- Offline-first approach for guest mode

### UI/UX Features
- Gradient purple theme (`#6b46c1` to `#7c3aed`)
- Smooth animations and transitions
- Responsive design (mobile-first)
- Loading states and error handling
- Accessibility considerations

## Component Guidelines

### State Management
- Use React hooks for local state
- Context API for auth state
- Custom hooks for complex logic
- No external state management library

### Styling Approach
- Tailwind CSS for utility classes
- Inline styles for dynamic values
- Custom CSS in `index.css` for complex styles
- Consistent color palette and spacing

### Error Handling
- Try-catch blocks in async operations
- User-friendly error messages
- Graceful fallbacks for API failures
- Console logging for debugging

### Performance Optimization
- Lazy loading for modals
- Memoization where appropriate
- Debounced search inputs
- Optimized image loading

## API Integration

### Backend Endpoints Used
```typescript
// Transcription
POST /api/transcribe

// Generation
POST /api/generate-title
POST /api/generate-story
POST /api/generate-images
POST /api/analyze-dream

// Dream CRUD
GET    /api/dreams
POST   /api/dreams
PUT    /api/dreams/:id
PATCH  /api/dreams/:id/favorite
DELETE /api/dreams/:id

// User Stats
GET /api/stats

// Text-to-Speech
POST /api/text-to-speech
```

### Request Headers
- `Authorization: Bearer <firebase-token>` for authenticated requests
- `Content-Type: application/json` for JSON payloads
- `Content-Type: multipart/form-data` for audio uploads

## Deployment Configuration

### Railway Deployment
- Uses `server.cjs` for production serving
- Serves built files from `dist/`
- Handles client-side routing
- Gzip compression enabled
- Security headers configured

### Build Process
1. TypeScript compilation
2. Vite bundling and optimization
3. Asset hashing for cache busting
4. Environment variable injection

## Development Best Practices

### Code Style
- Functional components with hooks
- TypeScript for type safety
- Descriptive variable names
- Component composition over inheritance

### Testing Approach
- Manual testing for UI/UX
- Console logging for debugging
- Error boundary implementation
- Cross-browser compatibility checks

### Git Workflow
- Feature branches
- Descriptive commit messages
- PR reviews before merging
- Keep `main` branch deployable

## Common Issues & Solutions

### Firebase Auth Popup Blocked
- Inform users to allow popups
- Provide clear error messages
- Consider redirect flow as fallback

### Audio Recording Permissions
- Request microphone access explicitly
- Handle permission denial gracefully
- Provide text input as alternative

### API Rate Limiting
- Show appropriate error messages
- Implement retry logic
- Cache responses where possible

### Mobile Responsiveness
- Test on various screen sizes
- Use responsive grid layouts
- Ensure touch-friendly interactions

## Future Enhancements

- Progressive Web App (PWA) support
- Offline mode with service workers
- Real-time collaboration features
- Advanced search and filtering
- Dream statistics and insights
- Social sharing capabilities
- Multiple language support
- Dark mode theme option