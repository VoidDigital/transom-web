# Transom Web Interface - Full-Stack Note-Taking Application

## Overview

This is the responsive web interface for Transom, a note-taking app for writers. Built with React, Express, and Firebase, it provides seamless synchronization with the iOS app, allowing users to access and manage their writing projects, notes, and tags from any device. The web interface maintains feature parity with the mobile app while offering a desktop-optimized experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state and custom hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (configured but not currently used)
- **Authentication**: Firebase Auth with Google sign-in
- **Data Storage**: Firestore for real-time data synchronization
- **Session Management**: In-memory storage with fallback to database storage

### Data Storage Solutions
- **Primary Database**: Firestore (NoSQL) for real-time features
- **Backup Database**: PostgreSQL with Drizzle ORM (configured for potential migration)
- **Schema Management**: Zod schemas for type-safe data validation
- **Real-time Updates**: Firestore listeners for live data synchronization

## Key Components

### Authentication System
- Firebase Authentication with dual sign-in options:
  - Email/password authentication for existing users
  - Google OAuth for new users or alternative sign-in
- Custom auth context and hooks for user state management
- Automatic token refresh and session persistence
- Protected routes and authentication guards
- Form validation with proper error handling
- Account creation with email verification

### Project Management
- Hierarchical organization with projects containing notes
- Project creation, selection, and management
- Note count tracking per project
- Real-time project updates

### Note Editor
- Rich text editing with custom toolbar
- Auto-save functionality with debounced updates
- Tag system for note categorization
- Real-time content synchronization
- Draft state management

### Mobile-First Design
- Responsive layout with mobile navigation
- Touch-optimized interactions
- Progressive enhancement for desktop features
- Mobile-specific UI patterns

## Data Flow

### Authentication Flow
1. User initiates Google sign-in via Firebase Auth
2. Authentication state managed through React context
3. User data synchronized with Firestore
4. Protected routes enforce authentication requirements

### Note Management Flow
1. Projects loaded from Firestore with real-time listeners
2. Notes filtered by selected project
3. Create/edit operations update Firestore immediately
4. Real-time listeners propagate changes to all connected clients
5. Auto-save prevents data loss during editing

### Search and Filtering
1. Client-side search across note titles and content
2. Tag-based filtering with multiple tag support
3. Real-time filtering as user types
4. Debounced search to optimize performance

## External Dependencies

### Firebase Services
- **Firebase Auth**: User authentication and session management
- **Firestore**: Real-time database for notes, projects, and user data
- **Firebase SDK**: Client-side integration

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **Embla Carousel**: Touch-friendly carousel component

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling and validation

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Express server for API endpoints
- Environment variables for Firebase configuration
- Replit-specific optimizations and error handling

### Production Build
- Vite build process generates optimized static assets
- Express server serves both API and static files
- ESBuild bundles server code for production
- Single-process deployment with built-in static file serving

### Environment Configuration
- Firebase project configuration via environment variables
- Separate development and production Firebase projects
- Database URL configuration for PostgreSQL backup
- Replit-specific development features

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 28, 2025. Initial setup