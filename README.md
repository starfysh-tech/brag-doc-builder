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
- 🔒 **Privacy-First**: No tracking, conversations happen directly with Claude

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download this repository**

2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   This will install dependencies and build the production version.

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run setup` - Install dependencies and build

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Nginx/Apache configuration
- Docker setup
- Static hosting (Netlify, Vercel, Cloudflare Pages)
- AWS S3 + CloudFront

### Quick Deploy to Static Hosting

**Netlify:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

## How It Works

1. **Choose Mode**: Select General (for employees) or Founder (for startup founders)
2. **Pick Timeframe**: Daily, weekly, or sprint
3. **Conversational Interview**: Answer questions about your work
4. **Intelligent Follow-ups**: Claude asks 2-4 follow-up questions to extract:
   - Quantifiable impact (numbers, metrics, time saved)
   - Business value (revenue, customers, team velocity)
   - Strategic insights and learnings
5. **Generate Entry**: Get a formatted brag doc entry in Markdown
6. **Export**: Copy or download your entry

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
- **Claude API** - Conversational AI (via browser fetch)

## Configuration

No configuration needed! The app works out of the box and doesn't require API keys or backend setup since it uses Claude's API directly from the browser.

## Privacy & Security

- **No Tracking**: We don't track or store your responses
- **Direct API Calls**: Conversations happen directly between your browser and Claude
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

## License

[Your License]

## Support

- Website: https://starfysh.net
- Issues: [GitHub Issues URL]

---

Made with ❤️ by Starfysh
