# Contributing to InterviewMaster

Thank you for your interest in contributing to InterviewMaster! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git
- Firebase account (for testing)
- Google Gemini API key (for testing)

### Getting Started

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-username/interview-master.git
   cd interview-master
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

### File Structure

- Follow existing directory structure
- Place components in `src/components/`
- Place utilities in `src/lib/`
- Place types in `src/types/`

### Naming Conventions

- **Components**: PascalCase (e.g., `InterviewRecorder.tsx`)
- **Utilities**: camelCase (e.g., `videoAnalysis.ts`)
- **Types**: PascalCase (e.g., `Interview.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

## Development Workflow

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/your-bug-fix
```

### Making Changes

1. Make your changes
2. Test locally
3. Ensure TypeScript compiles: `npm run build`
4. Check for linting errors: `npm run lint` (if configured)

### Committing Changes

Write clear, descriptive commit messages:

```bash
git commit -m "Add feature: description of what you added"
git commit -m "Fix bug: description of what you fixed"
```

### Pushing Changes

```bash
git push origin feature/your-feature-name
```

### Creating a Pull Request

1. Push your branch to GitHub
2. Create a pull request from your branch to `main`
3. Fill out the PR template (if available)
4. Wait for review and address feedback

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] TypeScript compiles without errors
- [ ] All features tested locally
- [ ] Documentation updated (if needed)
- [ ] No console errors
- [ ] No secrets committed

### PR Description

Include:

- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots (if UI changes)

### Code Review

- Be open to feedback
- Address all review comments
- Keep PRs focused and small when possible
- Respond to comments promptly

## Testing

### Manual Testing

Test the following before submitting:

- User registration/login
- Practice session creation
- Video recording
- Transcription
- AI analysis
- Results display
- Dashboard functionality
- Avatar mode (if applicable)

### Testing Checklist

- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on mobile devices
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All features functional

## Project Structure

```
interview-master/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── public/               # Static assets
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## Areas for Contribution

### Features

- New question categories
- Additional roles
- UI/UX improvements
- Performance optimizations
- Accessibility improvements

### Bug Fixes

- Report bugs via GitHub Issues
- Fix existing bugs
- Improve error handling

### Documentation

- Improve existing documentation
- Add code comments
- Create tutorials
- Update README

### Testing

- Add unit tests
- Add integration tests
- Improve test coverage

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Be patient with questions

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: Search existing GitHub Issues
- **Questions**: Open a discussion on GitHub

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions help make InterviewMaster better for everyone. Thank you for taking the time to contribute! 🎉
