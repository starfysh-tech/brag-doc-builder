# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Brag Doc Builder is a React-based single-page application that helps users create brag documents through conversational AI. The app uses Claude API directly from the browser and stores conversation state in URL hash parameters for ephemeral, shareable sessions.

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
- Direct Claude API integration via browser fetch

## Architecture

### State Management
The app uses React useState hooks with URL hash-based persistence:
- Conversation state is compressed and stored in URL hash using btoa/atob encoding
- State includes: mode, timeframe, messages, conversationState, bragDoc, collectedData
- URL updates occur when conversationState changes (see App.jsx:87-104)
- **Compression**: State JSON is URL-encoded → base64 encoded → URL-encoded again
- **Recovery**: Malformed hashes fail silently and reset to mode selection (App.jsx:80-82)

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
- **Authentication**: Direct API calls with no authentication headers - relies on CORS-enabled public endpoint

### File Structure
**Intentional single-component architecture** - all UI in `App.jsx` (668 lines):
- Mode/timeframe selection screens
- Chat interface with message history
- Live brag doc preview panel
- Dark/light mode toggle
- Share URL and export functionality

**When to Split Components (rare scenarios only):**
- File exceeds 1000 lines with distinct, decoupled features
- Need to reuse UI components across different apps
- Performance profiling shows render bottlenecks in specific sections
- Adding entirely new features unrelated to conversation flow

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
- Keep state flat - no deeply nested objects that complicate serialization

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
- Missing state fields get default values from useState initialization

## Constraints & Limitations

### URL Hash Size
- **Most browsers**: ~2KB hash limit (after compression)
- **Chrome**: ~64KB limit
- **Impact**: Long conversations may exceed browser limits
- **Mitigation**: Compression reduces typical state to <1KB; no explicit limit enforcement

### Browser Requirements
- Modern browser with ES6+ support
- Required APIs: `fetch`, `btoa`/`atob`, `navigator.clipboard`, `window.location.hash`
- Minimum versions: Chrome 63+, Firefox 55+, Safari 11.1+
- JavaScript must be enabled

### Data Privacy & Security
- No server-side storage - all data client-side only
- Conversations stored in URL hash only (ephemeral by design)
- Sharing URL shares entire conversation history
- No authentication/authorization required
- Cleared on reset/new session
- See App.jsx:660-662 for user-facing privacy notice

### Performance Considerations
- URL updates on every conversationState change - no throttling
- Message array grows unbounded during conversation
- No pagination for message history
- Large conversations increase render time and memory usage

## Testing

### Manual Test Checklist
Run `npm run dev` and verify:

**1. Mode & Timeframe Selection**
- Both modes (General, Founder) lead to correct first questions
- All three timeframes (daily, weekly, sprint) generate correct context

**2. Conversation Flow**
- Complete full conversation in both modes
- "Skip" button advances to next question (App.jsx:354-362)
- Enter key sends message (App.jsx:364-369)
- Conversation auto-scrolls to latest message (App.jsx:43-49)
- Input auto-focuses after assistant response (App.jsx:51-56)
- Transition to 'generating' state when Claude says "I have what I need"

**3. State Persistence & Sharing**
- Copy share URL mid-conversation
- Open URL in new tab → verify full state restored
- Test in incognito mode (should work - no localStorage dependency)
- Create long conversation → verify URL doesn't break browser
- Reload page with hash → state persists

**4. Brag Doc Generation**
- Verify markdown formatting matches template structure
- Check date format: YYYY-MM-DD
- Confirm mode-specific sections (General vs Founder categories)
- Verify metrics/numbers from conversation appear in output

**5. Export & Copy**
- Copy to clipboard button shows "Copied!" confirmation
- Download generates .md file with correct naming: `brag-doc-{mode}-{timeframe}-{date}.md`
- Downloaded file contains properly formatted markdown

**6. Dark/Light Mode**
- Toggle switches themes correctly
- All text remains readable in both modes
- Theme persists during conversation

**7. Cross-Browser Testing**
- Chrome, Firefox, Safari on desktop
- Mobile responsive layout at `lg:` breakpoint
- Test URL sharing across browsers

**8. Error Scenarios**
- Disconnect network mid-conversation → verify error message
- Malformed URL hash → should reset gracefully
- Rapid clicking send button → shouldn't duplicate messages

## Troubleshooting

### Share URL Not Working
- **Symptom**: Opening shared URL doesn't restore conversation
- **Causes**: URL truncated during copy/paste, browser URL length limit exceeded
- **Debug**: Check browser console for "Failed to restore state from URL" error (App.jsx:81)
- **Fix**: Copy from address bar after fresh page load; shorten conversation if needed

### State Not Persisting After Reload
- **Symptom**: Page refresh loses conversation state
- **Causes**: Hash not in URL, browser restrictions in private mode
- **Debug**: Verify `window.location.hash` contains compressed state
- **Fix**: Check that conversationState is not 'mode' or 'timeframe' (URL only updates after these, see App.jsx:88)

### API Calls Failing
- **Symptom**: "Sorry, I encountered an error" after sending message
- **Causes**: Network issues, CORS errors, API endpoint down
- **Debug**: Check browser console for fetch errors and network tab for failed requests
- **Fix**: Verify internet connection; check API endpoint status; ensure CORS headers present

### White Screen After Opening Share URL
- **Symptom**: Blank page with no content
- **Causes**: Decompression failure, invalid JSON in state
- **Debug**: Check console for JSON parse errors (App.jsx:65)
- **Fix**: URL likely corrupted; start fresh session

### Brag Doc Not Generating
- **Symptom**: Conversation continues indefinitely without generating doc
- **Causes**: Claude response doesn't include trigger phrase
- **Debug**: Check messages array for "I have what I need" text (App.jsx:229-231)
- **Fix**: Manually type "finish" or "done"; check that conversationState transitions to 'generating'

## Deployment
This is a static SPA deployable to any web server. See DEPLOYMENT.md for full details.

**Build Configuration:**
- Build outputs to `dist/` directory
- Requires web server configured for SPA routing (redirect all routes to index.html)
- No backend or environment variables needed for production build
- No build-time secrets or API keys to configure

**Production Requirements:**
- HTTPS required for secure clipboard API and Claude API calls
- Serve with cache headers for static assets
- Configure CSP headers if needed (allow connections to `api.anthropic.com`)
- No server-side rendering or API proxy needed

**Deployment Platforms:**
- Works on: Vercel, Netlify, GitHub Pages, Cloudflare Pages, any static host
- No special configuration beyond standard SPA routing
