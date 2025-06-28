# Transom Web Interface

A responsive web interface for the Transom note-taking app, built with React and Firebase. Provides seamless synchronization with the iOS app, allowing writers to access and manage their projects, notes, and tags from any device.

## Features

- **Dual Authentication**: Email/password and Google sign-in
- **Real-time Sync**: Seamless data synchronization with iOS app
- **Responsive Design**: Optimized for both desktop and mobile browsers
- **Rich Text Editor**: Full-featured note editing with auto-save
- **Project Management**: Hierarchical organization of notes within projects
- **Tag System**: Categorize and filter notes with tags
- **Cross-platform**: Share data between web and iOS applications

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
- Firestore for real-time database

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
   - Set up Firestore database
   - Add your hosting domain to Firebase authorized domains
   - Create required Firestore indexes (see Firebase Console for index creation links)

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Firebase Setup

### Required Firestore Indexes
The app requires these composite indexes in Firestore:

1. **Projects Collection**:
   - Fields: `userId` (Ascending), `updatedAt` (Descending), `__name__` (Descending)

2. **Notes Collection**:
   - Fields: `userId` (Ascending), `updatedAt` (Descending), `__name__` (Descending)

3. **Tags Collection**:
   - Fields: `userId` (Ascending), `name` (Ascending), `__name__` (Ascending)

Firebase will provide direct links to create these indexes when you first run the app.

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

The web interface connects to the same Firebase project as the iOS app, ensuring:
- Real-time synchronization of notes and projects
- Shared user authentication
- Consistent data across all platforms
- Automatic conflict resolution

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