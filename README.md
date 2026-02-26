# Orbital Note

A cross-platform note-taking application built with Expo and React Native, featuring Google OAuth authentication and Google Drive synchronization.

## Overview

Orbital Note is a modern, cloud-synchronized note-taking app available on Android, and Web. It provides users with a seamless experience across devices using Google authentication and real-time synchronization with Google Drive.

## Features

- 🔐 **Google OAuth Authentication** - Secure login via Google Account
- ☁️ **Google Drive Sync** - Automatic synchronization of notes
- 📝 **Rich Text Editor** - TipTap on web, TenTap on mobile
- 🎯 **Cross-Platform** - Native Android and web support
- 📱 **Responsive Design** - Optimized for all screen sizes
- ⚡ **Type-Safe** - Full TypeScript support

## Tech Stack

- **Framework**: React Native + Expo
- **Routing**: Expo Router
- **Language**: TypeScript
- **Authentication**: expo-auth-session + Google OAuth
- **Cloud Sync**: Google Drive API
- **Editors**: TipTap (web), TenTap (mobile)
- **Build Tool**: Expo

## Requirements

- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- For Android: Android Studio or Android SDK
- Google Cloud Project with OAuth 2.0 credentials

## Installation

```bash
# Clone the repository
git clone https://github.com/vxeque/orbital-note.git
cd orbital-note

# Install dependencies
npm install

# or using yarn
yarn install
```

## Environment Configuration

Create a `.env.local` file in the project root with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Client ID for web | `123456789.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Client ID for Android | `123456789-android.apps.googleusercontent.com` |

### Example `.env.local`

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

> ⚠️ **Security Note**: Never commit `.env.local` to version control. Use `.env.example` for documentation.

## Running the Application

### Start Development Server

```bash
npm run start
```

### Web Platform

```bash
npm run web
```

Access at `http://localhost:8081`

### Android Platform

```bash
npm run android
```

Requires Android emulator or connected device.

### Linting

```bash
npm run lint
```

### Reset Project

```bash
npm run reset-project
```

Clears cache and rebuilds the project.

## Project Structure

```
orbital-note/
├── app/                     # Expo Router pages and routing
│   ├── (auth)/              # Authentication stack
│   ├── (app)/               # Main application stack
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # External service integrations
│   │   ├── auth/            # Google OAuth logic
│   │   └── drive/           # Google Drive API
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── constants/           # App constants
├── assets/                  # Images, fonts, static files
├── .env.local               # Local environment variables (git-ignored)
├── .env.example             # Environment template
├── tsconfig.json            # TypeScript configuration
├── app.json                 # Expo configuration
└── package.json             # Dependencies
```

## Authentication & Sync Flow

### Authentication Flow

```
1. User opens app → Check stored token
2. No token → Show login screen
3. User taps "Login with Google"
4. expo-auth-session redirects to Google OAuth
5. User grants permissions
6. Token stored in expo-secure-store
7. Redirect to main app
```

### Synchronization Flow

```
1. User creates/edits note
2. Note saved locally (AsyncStorage/SQLite)
3. Background sync job triggered
4. Authenticate with stored token
5. Upload/update note to Google Drive
6. Save sync timestamp
7. Handle conflicts (last-write-wins)
```

## Security Considerations

### Token Management

- OAuth tokens stored in **expo-secure-store** (platform-native encryption)
- Refresh tokens automatically renewed
- Tokens cleared on logout

### Google Drive Scope

- `https://www.googleapis.com/auth/drive.file` - Only app-created files
- Minimal required permissions

### HTML Sanitization

- All user content sanitized before storage
- DOMPurify or similar used in rich text editors
- XSS protection on web platform

## Troubleshooting

### OAuth Redirect Loop

**Issue**: Redirecting infinitely during login

**Solution**:
- Verify Client IDs match in Google Cloud Console
- Clear app cache: `npm run reset-project`
- Check that redirect URI matches configuration

### Google Drive Sync Fails

**Issue**: Notes not syncing to Drive

**Solution**:
- Verify token has `drive.file` scope
- Check network connectivity
- Ensure Drive API is enabled in Google Cloud Console
- Inspect console logs for API error codes

### Module Not Found: 'expo-secure-store'

**Issue**: TypeScript cannot find the module

**Solution**:
```bash
expo install expo-secure-store
```

Add type declaration if needed:
```typescript
// src/declarations.d.ts
declare module 'expo-secure-store';
```

### Android Build Fails

**Issue**: Build errors during `npm run android`

**Solution**:
- Clear gradle cache: `rm -rf android/.gradle`
- Update gradle: `./gradlew wrapper --gradle-version latest`
- Clean build: `npm run reset-project`

## Technical Roadmap

- [ ] **Offline Mode** - Local-first sync with conflict resolution
- [ ] **Collaborative Editing** - Real-time multi-user notes
- [ ] **End-to-End Encryption** - Client-side encryption for Drive storage
- [ ] **AI Features** - Smart organization, summarization
- [ ] **Export Formats** - PDF, Markdown, HTML export
- [ ] **Tags & Collections** - Advanced note organization
- [ ] **Voice Notes** - Audio recording and transcription
- [ ] **Performance** - Image compression, incremental sync

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

## Support

For issues and questions:
- Check existing GitHub Issues
- Review troubleshooting section above
- Contact development team