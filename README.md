# Brag Doc Builder

An interactive tool that helps you create compelling brag documents by extracting the value and impact behind your work through intelligent conversation with Claude.

**Powered by Starfysh** • Turn friction into flow

## Features

- 🎯 **Mode Selection**: Choose between General or Founder modes for tailored questions
- ⏱️ **Flexible Timeframes**: Daily, weekly, or sprint-based entries
- 💬 **Intelligent Conversation**: Claude asks follow-up questions to extract impact and metrics
- 📊 **Impact-Focused**: Emphasizes quantifiable outcomes and business value
- 🌓 **Dark/Light Mode**: Comfortable viewing in any environment
- 🔗 **Shareable URLs**: Share your conversation via URL (no server storage)
- 📥 **Export Options**: Copy to clipboard or download as Markdown
- 🔒 **Privacy-First**: No tracking, conversations happen directly with Claude (or via optional Vercel proxy)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Development

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh

# Start development server
npm run dev
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Modes

### General Mode
Perfect for employees and contributors tracking:
- Projects & Impact
- Collaboration & Mentorship
- Design & Documentation
- What I Learned

### Founder Mode
Tailored for startup founders tracking:
- Customer & Revenue Impact
- Team & Velocity
- Strategic Decisions & Insights
- What I Learned

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Claude API** - Conversational AI (via browser fetch or optional Vercel proxy)

## Configuration

No configuration needed! The app works out of the box. API calls can be made directly from the browser to Claude's API, or optionally routed through a Vercel serverless proxy function.

## Privacy & Security

- **No Tracking**: We don't track or store your responses
- **Direct API Calls**: Conversations happen directly between your browser and Claude (or via proxy)
- **URL State**: Conversation state stored in URL hash (client-side only)
- **See Anthropic's Privacy Policy** for details on how Claude handles data

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## About Starfysh

Starfysh helps technical founders scale operations without the friction. Learn more at [starfysh.net](https://starfysh.net).

## Support

- Website: https://starfysh.net
- Issues: [GitHub Issues URL]

---

Made with ❤️ by Starfysh
