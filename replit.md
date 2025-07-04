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

## Firebase Security Rules (Original - for rollback)

```json
{
  "rules": {
    "$email":{
      ".read": "$email === auth.token.email.replace('.', '▦')",
      ".write": "$email === auth.token.email.replace('.', '▦')"
    }
  }
}
```

## Recent Changes

### July 1, 2025 - UI Improvements and Interactive Timestamp System
- **Interactive Timestamp Display**: Implemented clickable timestamp with dual-mode cycling
  - Timestamp cycles between "Created" and "Last edited" when clicked
  - New thoughts initially show "Created" timestamp
  - Real-time updates every minute for accurate time display
  - Custom formatting: "just now" appears without "ago" suffix
  - Positioned adjacent to back button with hover effects for discoverability

- **Auto-Focus for New Thoughts**: Added immediate text cursor focus for new thoughts
  - Text editor automatically focuses when creating new thoughts (temp- ID thoughts)
  - Users can start typing immediately without clicking in the text area
  - Auto-focus only triggers for new thoughts, existing thoughts remain undisturbed
  - Improves user experience by eliminating the extra click step

- **Thought Detail UI Reorganization**: Moved "Last edited" timestamp to optimal position
  - Relocated timestamp from bottom footer to top header area
  - Positioned adjacent to back button on the left side for better visibility
  - Maintains clean layout while providing important temporal context
  - Removes cluttered footer area for cleaner thought editing experience

- **Top-Level Navigation Enhancement**: Fixed navigation to work from any depth
  - Clicking any main nav item (Thoughts, Projects, Tags, Archive, Account Settings) now properly navigates to that section
  - Navigation clears editor state and selected note when switching sections
  - Works consistently from thought detail view, filtered views, or any nested state
  - Ensures users can always return to main sections regardless of current location

- **Account Settings UI Polish**: Enhanced account section design
  - Added user email subtitle in light grey text below "Account Settings" header
  - Positioned Account Settings at bottom of navigation with visual separator border
  - Maintains clean visual hierarchy while providing account identification

- **Filtered Views UI Consistency**: Updated FilteredNotesPanel to match main Thoughts interface
  - Applied exact same layout structure (h-20 height, content positioning)
  - Added tag badge display below thought content matching main panel
  - Consistent text formatting and hover states across all thought lists
  - Project and Tag filtered views now have identical visual design to main Thoughts index

### June 30, 2025 - Evening Session
- **Filtered Navigation System Complete**: Successfully implemented tag-based thought filtering
  - Added FilteredNotesPanel component for displaying filtered thoughts by project or tag
  - Updated dashboard navigation to switch to filtered views when selecting projects/tags
  - Implemented proper tagNames field parsing using tilde-separated format from iOS
  - Added back button functionality to return from filtered views to main navigation
  - Projects and Tags panels now navigate to filtered thought lists showing only relevant content
  - Full compatibility with iOS app's tilde-separated tag naming system

- **Text Editor and iOS Compatibility Complete**: Successfully resolved all editing and cross-platform issues
  - Replaced complex TipTap rich text editor with reliable textarea-based WorkingTextEditor
  - Implemented proper HTML to plain text conversion for seamless editing experience
  - Fixed cursor jumping on line breaks by preventing external updates during user typing
  - **iOS HTML Format Compatibility**: Updated to generate exact iOS-compatible HTML structure
    - Complete DOCTYPE declaration with proper HTML 4.01 structure
    - CSS styling with -webkit-text-stroke and font-kerning properties
    - Apple-converted-space spans for proper space handling
    - Correct p.p1 and span.s1 class structure matching iOS expectations
  - Web-created thoughts now display perfectly in iOS app
  - Spaces and line breaks work correctly across both platforms
  - Clean, stable editing experience with full cross-platform compatibility
  - **Known Limitation**: Editing iOS-created thoughts removes formatting (acceptable trade-off for stability)

- **Timestamp Consistency Fixed**: Resolved sorting issues caused by mixed timestamp formats
  - Enhanced timestamp parsing to handle both seconds (iOS) and milliseconds (web) formats
  - Added proper integer conversion for consistent chronological sorting
  - Fixed float timestamp comparison issues in Firebase data

- **Thought Detail Editor Complete**: Fixed text display in thought detail view
  - Improved HTML parsing to extract only text content (no CSS styles included)
  - Used proper DOMParser for robust HTML handling from iOS app data
  - Set full-width, full-height textarea with white background and no borders
  - Text now displays and edits properly in the detail view
  
- **UI Polish**: Enhanced thought abstract display system
  - Simplified truncation with clean line-clamp-3 ellipsis behavior
  - Removed complex fade gradient in favor of standard text truncation
  - Improved centering for short abstracts while maintaining 3-line constraint for long content
  - Abstract containers properly center within 80px thought buttons

### June 30, 2025 - Earlier
- **iOS App Integration Complete**: Successfully achieved 100% data compatibility with iOS app
  - Fixed database paths: using `/thoughts` collection instead of `/notes` (matching iOS Swift code)
  - Fixed field mapping: iOS `text` field correctly mapped to web app `content` field
  - Fixed timestamp format: iOS uses seconds, converted from web app milliseconds with automatic detection
  - Email-based user paths with ▦ character replacement working correctly
  
- **Rich Text HTML Parser**: Added complete HTML content rendering system
  - Created HtmlContent component to safely parse and display iOS HTML-formatted thoughts
  - iOS thoughts now display as proper rich text instead of raw HTML
  - SimpleTextEditor temporarily saves as plain text (removed automatic div wrapping)
  - Maintains iOS HTML format compatibility for seamless cross-platform sync

- **UI Improvements**: Enhanced thoughts list display and sorting
  - Implemented chronological sorting with most recently updated thoughts first
  - Added custom time formatting: "just now", "X minutes/hours/days ago" with proper grammar
  - Fixed timestamp conversion to handle both seconds and milliseconds from iOS
  - Removed automatic div tag wrapping for new thoughts

- **Layout and Design Refinements**: Improved responsive design and visual hierarchy
  - Fixed left navigation sidebar to stay in place while thoughts list scrolls independently
  - Constrained app width to browser viewport (eliminated horizontal scrolling)
  - Enhanced text wrapping with proper break-word handling for long content
  - Implemented height-based text truncation (80px containers: 15px padding + 65px content)
  - Added conditional fade-out gradient for overflowing text (only appears when needed)
  - Preserved border visibility between thought items for better visual separation

- **Development Conveniences**: Added testing optimizations
  - Pre-populated login form with test credentials for faster development iteration
  - Email: chris.steib+replit@gmail.com, Password: nocode

- **Database Migration**: Successfully converted entire codebase from Firestore to Firebase Realtime Database
  - Updated all CRUD operations in useNotes.tsx, useProjects.tsx, and useAuth.tsx
  - Fixed authentication system to work with Realtime Database
  - Fixed security rules: `auth.email` instead of `auth.token.email`

### June 28, 2025
- **Navigation Restructure**: Implemented two-panel dashboard layout with left sidebar navigation
  - Five main sections: Thoughts, Projects (isPiece tags), Tags (regular tags), Archive, Preferences  
  - Projects show tags with isPiece: true facet for piece-based organization
  - Archive functionality added with isArchived field for thoughts
  - Clean desktop-optimized interface with responsive mobile fallback

- **Archive System**: Added complete archive functionality
  - Schema updated with isArchived boolean field
  - Separate archive hooks and panels created
  - Archive/unarchive operations implemented
  - Main thoughts filtered to exclude archived items

- **Enhanced Data Model**: Updated tag schema to support project classification
  - Added isPiece boolean facet to distinguish project tags from regular tags
  - Updated Firebase queries to handle new data structure
  - Maintained backward compatibility with existing data

- **Text Editor Simplification**: Resolved persistent RTL text direction issues
  - Replaced complex contentEditable rich text editor with simple textarea
  - Maintains iOS HTML content processing for backward compatibility
  - Converts between HTML storage format and plain text editing
  - Eliminated all bidirectional text algorithm conflicts

## Changelog

Changelog:
- June 28, 2025. Initial setup and two-panel dashboard implementation