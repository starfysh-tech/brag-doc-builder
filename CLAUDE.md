# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Brag Doc Builder is a React-based single-page application that helps users create brag documents through conversational AI. The app uses Claude API directly from the browser and stores conversation state in URL hash parameters.

**Solo-maintained project**: Changes should preserve the intentional single-component architecture.

## Development Commands
- `npm run dev` - Start development server on port 3000
- `npm run build` - Production build to dist/ directory
- `npm run preview` - Preview production build locally
- `npm run setup` - Install dependencies and build

## Tech Stack
- React 18 with Vite build tool
- Tailwind CSS for styling
- Lucide React for icons
- Direct Claude API integration via browser fetch (no backend, no authentication)

## Architecture

### Single-Component Pattern
**All UI lives in `App.jsx` (~668 lines)** - this is intentional:
- Mode/timeframe selection screens
- Chat interface with message history
- Live brag doc preview panel
- Dark/light mode toggle
- Share URL and export functionality

**Do not split into multiple components** unless the file exceeds 1000 lines with distinct, decoupled features.

### State Management
The app uses React useState hooks with URL hash-based persistence:
- State includes: mode, timeframe, messages, conversationState, bragDoc, collectedData
- Compressed and stored in URL hash using btoa/atob (App.jsx:5-19)
- URL updates when conversationState changes (App.jsx:87-104)
- **Important**: URL hash has size limits (~2KB most browsers) - avoid adding large data to state
- Malformed hashes fail silently and reset to mode selection (App.jsx:80-82)

**When adding new state fields:**
1. Add useState at top of component
2. Update state serialization in useEffect (App.jsx:88-96)
3. Update decompression logic if needed (App.jsx:65-78)
4. Keep state flat - no deeply nested objects

### Conversation Flow States
1. `mode` - User picks General or Founder mode
2. `timeframe` - Daily, weekly, or sprint
3. `collecting` - Conversational interview with Claude
4. `generating` - Generate brag doc from conversation
5. `complete` - Display final output with copy/download options

### Claude API Integration
Direct API calls to `https://api.anthropic.com/v1/messages`:
- `callClaude()` (App.jsx:122-242) - Conversational interview with system prompts
- `generateBragDoc()` (App.jsx:244-340) - Final markdown generation
- Model: `claude-sonnet-4-20250514`
- **No authentication headers** - direct browser-to-API calls
- System prompts differ by mode (General vs Founder)
- Conversation ends when Claude says "I have what I need" (App.jsx:229-231)

**Do not add:**
- API key handling (none needed)
- Backend proxy (not used)
- Authentication layers (not needed)

## Code Style & Conventions

### Naming
- Use camelCase for variables/functions (JavaScript/React standard)
- Use PascalCase for React components
- Boolean variables: prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)
- Event handlers: prefix with `handle` (e.g., `handleSend`, `handleSkip`)

**Note**: This project uses camelCase, NOT snake_case.

### Tailwind Class Ordering
Order classes: layout → sizing → spacing → colors → typography → effects

Example:
```jsx
className="flex-1 overflow-y-auto mb-4 bg-slate-950/50 rounded-xl p-4 border border-slate-800 text-sm text-slate-300"
```

Dynamic theme classes use template literals (App.jsx:414-425):
```jsx
const cardBg = darkMode ? 'bg-slate-900/50' : 'bg-white/80';
```

### Component Organization in App.jsx
**Strict order:**
1. Helper functions outside component (compress, decompress)
2. React hooks at component top
3. API functions (callClaude, generateBragDoc)
4. UI event handlers (handleSend, handleSkip, etc.)
5. Dynamic theme variables (bgGradient, textPrimary, etc.)
6. Render logic

**Follow this pattern when adding new code.**

### State Update Patterns
- Always use functional setState for arrays/objects:
  ```jsx
  setMessages(prev => [...prev, newMessage]);
  ```
- Derive values instead of storing redundant state:
  ```jsx
  // Good: derive from existing state
  const canSend = !isLoading && userInput.trim();

  // Bad: store in separate state
  const [canSend, setCanSend] = useState(false);
  ```

## Error Handling

### API Failures
- Failed Claude API calls show: "Sorry, I encountered an error. Please try again."
- No automatic retry logic - users manually retry
- All network errors caught in try/catch (App.jsx:238-241, 336-339)
- Log to console: `console.error('Error calling Claude:', error)`

### State Recovery
- Malformed URL hash fails silently, resets to mode selection
- No state validation - URL state is trusted if parseable
- Missing state fields use useState defaults

## Key Constraints

### URL Hash Storage
- State stored in compressed URL hash (btoa/atob encoding)
- Size limit ~2KB most browsers, ~64KB Chrome
- **When adding state fields**: keep data minimal, compression helps but has limits
- Large conversations may exceed browser limits (no enforcement)

### No Backend
- Static SPA, no server-side code
- No API keys, no authentication, no database
- All data lives client-side only
- Conversations stored only in URL hash

## Common Patterns

### Adding a New UI Section
1. Add to render logic at bottom of component
2. Use existing theme variables (`cardBg`, `textPrimary`, etc.)
3. Follow Tailwind class ordering
4. Maintain responsive `lg:` breakpoints for desktop layouts

### Adding New State
1. Add useState hook at top
2. Update URL serialization (App.jsx:88-96)
3. Update URL deserialization (App.jsx:65-78)
4. Test URL sharing works with new state

### Modifying API Calls
- System prompts in `callClaude()` differ by mode (General vs Founder)
- Generation prompts in `generateBragDoc()` create structured markdown
- Model, max_tokens defined inline - no config file
- Check trigger phrases (App.jsx:229-231) if changing conversation end logic

## What NOT to Do

- ❌ Do not add API key handling or environment variables
- ❌ Do not create separate component files (keep single-component architecture)
- ❌ Do not use snake_case (use camelCase)
- ❌ Do not add backend/server code
- ❌ Do not store large objects in state (URL hash size limits)
- ❌ Do not add useState without updating URL serialization
- ❌ Do not create new markdown files unless explicitly requested

## Testing
Manual testing only via `npm run dev`. See CHECKLIST.md for deployment verification steps.

**Quick test:**
1. Select mode and timeframe
2. Complete conversation
3. Copy share URL
4. Open URL in new tab → verify state restored

## Deployment
See DEPLOYMENT.md for deployment instructions. This is a static SPA requiring only a web server configured for SPA routing (redirect all to index.html).
