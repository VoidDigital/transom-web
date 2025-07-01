# GitHub Setup Guide

## Initial Setup (First Time Only)

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add Remote Repository
Replace `your-username` with your GitHub username and `your-repo-name` with your desired repository name:
```bash
git remote add origin https://github.com/your-username/your-repo-name.git
```

### 3. Add All Files
```bash
git add .
```

### 4. Create Initial Commit
```bash
git commit -m "Initial commit: Transom web interface with interactive timestamps and auto-focus

- Complete React/TypeScript frontend with Firebase integration
- Interactive timestamp system with Created/Last edited cycling
- Auto-focus functionality for new thoughts
- Real-time edit detection and timestamp updates
- Cross-platform compatibility with iOS app
- Archive system and enhanced navigation
- Responsive design with shadcn/ui components"
```

### 5. Push to GitHub
```bash
git push -u origin main
```

## Future Updates

For subsequent pushes, use these commands:

```bash
# Add changes
git add .

# Commit with a descriptive message
git commit -m "Brief description of changes"

# Push to GitHub
git push
```

## Environment Setup for New Deployments

When deploying to a new environment, remember to:

1. Set up environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID` 
   - `VITE_FIREBASE_APP_ID`

2. Configure Firebase:
   - Enable Authentication (Email/Password and Google)
   - Set up Realtime Database with security rules
   - Add hosting domain to authorized domains

## Tips

- Always review changes before committing: `git status` and `git diff`
- Use descriptive commit messages that explain what was changed and why
- Push regularly to keep your GitHub repository up to date
- Consider using branches for major new features