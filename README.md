# Transom Web Interface

A responsive web interface for the Transom note-taking app, built with React and Firebase. Provides seamless synchronization with the iOS app, allowing writers to access and manage their projects, notes, and tags from any device.

## Features

- **Dual Authentication**: Email/password and Google sign-in
- **Real-time Sync**: Seamless data synchronization with iOS app
- **Responsive Design**: Optimized for both desktop and mobile browsers
- **Smart Text Editor**: Auto-focus on new thoughts with instant editing capabilities
- **Interactive Timestamps**: Clickable timestamps cycling between "Created" and "Last edited" with real-time updates
- **Project Management**: Hierarchical organization of thoughts within projects
- **Tag System**: Categorize and filter thoughts with tags
- **Archive System**: Archive and restore thoughts with dedicated archive view
- **Cross-platform Compatibility**: Perfect synchronization with iOS app data and formatting
- **Real-time Navigation**: Seamless switching between sections from any view depth

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and builds
- Tailwind CSS with shadcn/ui components
- React Query for server state management
- Wouter for lightweight routing

### Backend
- Node.js with Express
- TypeScript throughout
- Firebase Authentication
- Firebase Realtime Database for live synchronization

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VoidDigital/transom-web.git
cd transom-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id_here
```

4. Configure Firebase:
   - Enable Authentication with Email/Password and Google providers
   - Set up Firebase Realtime Database with the following security rules:
   ```json
   {
     "rules": {
       "$email": {
         ".read": "$email === auth.email.replace('.', '▦')",
         ".write": "$email === auth.email.replace('.', '▦')"
       }
     }
   }
   ```
   - Add your hosting domain to Firebase authorized domains

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Firebase Setup

### Authentication Setup
1. Enable Email/Password authentication
2. Enable Google authentication
3. Add your hosting domain to authorized domains
4. Configure OAuth consent screen for Google sign-in

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── pages/        # Main application pages
│   │   └── main.tsx      # Application entry point
│   └── index.html
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── vite.ts           # Vite development setup
├── shared/               # Shared TypeScript schemas
│   └── schema.ts         # Zod validation schemas
└── package.json
```

## Deployment

### Recommended Hosting Platforms

1. **Vercel** (Recommended)
   - Optimized for React applications
   - Free tier with generous limits
   - Automatic deployments from GitHub

2. **Netlify**
   - Great React support
   - Free tier available
   - Simple deployment process

3. **Firebase Hosting**
   - Natural integration with Firebase backend
   - Global CDN included

### Environment Variables for Production
Set these environment variables in your hosting platform:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

## Data Synchronization

The web interface connects to the same Firebase Realtime Database as the iOS app, ensuring:
- Real-time synchronization of thoughts, projects, and tags
- Shared user authentication across all platforms
- Live updates as data changes in the iOS app
- Perfect HTML format compatibility with iOS thought formatting
- Automatic empty thought cleanup for optimal data management

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- TypeScript throughout for type safety
- ESLint and Prettier for code consistency
- Component-based architecture
- Custom hooks for reusable logic

## Recent Updates

### July 1, 2025
- **Interactive Timestamp System**: Clickable timestamps that cycle between "Created" and "Last edited" with real-time minute-by-minute updates
- **Smart Auto-Focus**: New thoughts automatically focus the text editor for immediate typing
- **Real-time Edit Detection**: Timestamps automatically switch to "Last edited just now" when content is modified
- **Enhanced Navigation**: Top-level navigation works from any view depth with proper state management
- **UI Consistency**: Unified design across all thought list views (main, filtered, and archive)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary to VoidDigital.

## Support

For issues or questions, please open a GitHub issue or contact the development team.