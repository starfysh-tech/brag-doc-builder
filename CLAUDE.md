# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Brag Doc Builder is a React-based single-page application that helps users create brag documents through conversational AI. The app uses Claude API directly from the browser (no backend) and stores conversation state in URL hash parameters.

## Project Maintenance
This is a solo-maintained project. Changes should preserve the intentional single-component architecture.

## Development Commands
- `npm run dev` - Start development server on port 3000
- `npm run build` - Production build to dist/ directory
- `npm run preview` - Preview production build locally
- `npm run setup` - Install dependencies and build

## API Key Management
- API keys stored in backend or hosting platform secrets (e.g., Vercel environment variables)
- Never commit API keys to the repository
- Keys accessed via backend proxy or server-side environment variables

## Tech Stack
- React 18 with Vite build tool
- Tailwind CSS for styling
- Lucide React for icons
- Direct Claude API integration via browser fetch (no API keys stored in app)

## Architecture

### State Management
The app uses React useState hooks with URL hash-based persistence:
- Conversation state is compressed and stored in URL hash using btoa/atob encoding
- State includes: mode, timeframe, messages, conversationState, bragDoc, collectedData
- URL updates occur when conversationState changes (see App.jsx:87-104)

### Conversation Flow
1. **Mode Selection** (`conversationState: 'mode'`) - User picks General or Founder mode
2. **Timeframe Selection** (`conversationState: 'timeframe'`) - Daily, weekly, or sprint
3. **Collecting** (`conversationState: 'collecting'`) - Conversational interview with Claude
4. **Generating** (`conversationState: 'generating'`) - Generate brag doc from conversation
5. **Complete** (`conversationState: 'complete'`) - Display final output with copy/download options

### Claude API Integration
The app makes direct API calls to `https://api.anthropic.com/v1/messages`:
- `callClaude()` (App.jsx:122-242) - Handles conversational interview with system prompts
- `generateBragDoc()` (App.jsx:244-340) - Final generation with structured markdown template
- Model: `claude-sonnet-4-20250514`
- System prompts differ by mode (General vs Founder) with specific extraction rules

### File Structure
**Intentional single-component architecture** - all UI in `App.jsx` (668 lines):
- Mode/timeframe selection screens
- Chat interface with message history
- Live brag doc preview panel
- Dark/light mode toggle
- Share URL and export functionality
- Do not split into multiple components unless absolutely necessary

## Code Style & Conventions

**Note**: This project follows React/JavaScript conventions (camelCase), not snake_case.

### Naming
- Use camelCase for variables and functions (JavaScript/React standard)
- Use PascalCase for React components
- Boolean variables: prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)
- Event handlers: prefix with `handle` (e.g., `handleSend`, `handleSkip`)

### State Management Patterns
- All state lives in App.jsx component
- State updates must preserve URL hash-based persistence
- When adding state fields, update the state serialization in useEffect at lines 88-96
- Derive computed values rather than storing redundant state

### Tailwind Usage
- Order classes: layout → sizing → spacing → colors → typography → effects
- Dynamic theme classes via template literals (see lines 414-425)
- Theme colors: slate palette for both dark/light modes with different shades
- Responsive prefixes: `lg:` for desktop-specific layouts

### Component Organization in App.jsx
- Helper functions (compress, decompress) outside component
- React hooks at top of component
- API functions (callClaude, generateBragDoc) after hooks
- UI event handlers (handleSend, handleSkip, etc.) after API functions
- Render logic at bottom

## Error Handling

### API Failures
- Failed Claude API calls show: "Sorry, I encountered an error. Please try again." (App.jsx:239-240)
- No automatic retry logic - users must manually retry
- Network errors caught in try/catch blocks (App.jsx:238-241, 336-339)
- Log errors to console for debugging: `console.error('Error calling Claude:', error)`

### State Recovery
- Malformed URL hash fails silently and starts fresh (App.jsx:80-82)
- If decompression fails, app resets to mode selection
- No state validation - URL state is trusted if parseable

## Testing
- No automated tests - all testing is manual via `npm run dev`
- Test both modes (General and Founder) across all timeframes
- Verify conversation flow, state persistence, copy/download, and share URL
- Test on Chrome, Firefox, and Safari

## Deployment
This is a static SPA deployable to any web server. See DEPLOYMENT.md for full details.
- Build outputs to `dist/` directory
- Requires web server configured for SPA routing (redirect all to index.html)
- No backend or environment variables needed for production build
- HTTPS required in production for API calls
