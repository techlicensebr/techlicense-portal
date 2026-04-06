# TechLicense Chatbot Admin Portal

A modern, full-featured admin dashboard for managing TechLicense chatbots. Built with Next.js 15, React 19, and Tailwind CSS v4.

## Features

- **Dashboard**: Real-time KPIs and conversation metrics
- **Bot Management**: Create, configure, and manage chatbots
- **Conversations**: View and manage customer conversations
- **Knowledge Base**: Upload and manage documents for knowledge bases
- **Analytics**: Comprehensive usage analytics and performance metrics
- **API Keys**: Secure API key management
- **Webhooks**: Event-driven integrations
- **Settings**: Account, organization, billing, and security settings

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Lucide React Icons
- **HTTP Client**: Axios
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Cloudflare Pages account (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_API_URL=https://techlicense-chatbot-api.techlicensebr.workers.dev
NEXT_PUBLIC_API_VERSION=v1
```

## Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Deployment to Cloudflare Pages

```bash
# Build and deploy
npm run build
npm run deploy
```

Or use Cloudflare Pages dashboard for automatic deployments from git.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/               # Login page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard
│   ├── bots/                    # Bot management
│   ├── conversations/           # Conversation management
│   ├── knowledge/               # Knowledge base
│   ├── analytics/               # Analytics dashboard
│   ├── api-keys/                # API key management
│   ├── webhooks/                # Webhook management
│   ├── settings/                # User settings
│   └── globals.css              # Global styles
├── components/
│   ├── Sidebar.tsx              # Navigation sidebar
│   └── Header.tsx               # Top header
├── lib/
│   └── api.ts                   # API client
└── types/                       # TypeScript types
```

## API Integration

The portal connects to the TechLicense API at `https://techlicense-chatbot-api.techlicensebr.workers.dev`.

### Authentication

API requests require Bearer token authentication:

```
Authorization: Bearer YOUR_API_KEY
```

### Main Endpoints

- `GET /bots` - List bots
- `POST /bots` - Create bot
- `GET /conversations` - List conversations
- `GET /analytics` - Get analytics
- `GET /api-keys` - List API keys
- `GET /webhooks` - List webhooks

## Customization

### Brand Colors

Edit `tailwind.config.ts` to customize brand colors:

```ts
colors: {
  primary: '#2563eb',           // Main blue
  sidebar: '#0f172a',           // Dark sidebar
  // ... more colors
}
```

### Logo

Update the logo in `src/components/Sidebar.tsx`:

```tsx
<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
  TL
</div>
```

## Features in Detail

### Dashboard
- Real-time KPIs (conversations, messages, tokens, CSAT)
- Message trends visualization
- Recent conversations list
- Quick action buttons

### Bots
- Create and manage multiple chatbots
- Configure AI model parameters
- Define system prompts
- Set up guardrails
- Enable channels (web, WhatsApp, Telegram, etc.)

### Conversations
- Search and filter conversations
- View conversation threads
- Real-time message streaming
- Status tracking (active/completed)

### Knowledge Base
- Drag-and-drop document upload
- Support for PDF, DOCX, TXT, MD, CSV
- Token usage tracking
- Processing status monitoring

### Analytics
- Conversation trends
- Satisfaction score tracking
- Bot performance comparison
- Token consumption charts

### API Keys
- Generate secure API keys
- Key rotation support
- Usage tracking
- Scoped permissions

### Webhooks
- Event-driven integrations
- Webhook logs and retry handling
- Support for multiple events
- Test endpoint functionality

## Development

### Adding New Pages

1. Create new folder in `src/app/`
2. Add `page.tsx` file
3. Use the layout from root
4. Update sidebar navigation in `src/components/Sidebar.tsx`

### Styling

All styling uses Tailwind CSS classes. Custom components are defined in `src/app/globals.css`:

```css
.btn-primary { /* ... */ }
.card { /* ... */ }
.input-field { /* ... */ }
```

## Performance

- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- Efficient CSS with Tailwind CSS
- API response caching strategies

## Security

- HTTPS only for API communications
- Secure API key storage (never in git)
- CSRF protection with Next.js
- XSS prevention
- Secure headers configured

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port already in use

```bash
# On Linux/Mac
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Build errors

```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### API connection issues

1. Check `.env.local` has correct API URL
2. Verify API is running and accessible
3. Check network tab in browser DevTools
4. Ensure CORS is properly configured on API

## License

Proprietary - TechLicense Inc.

## Support

For support, email support@techlicensebr.com

## Roadmap

- [ ] Dark mode toggle
- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Team collaboration features
- [ ] Custom integrations
- [ ] Mobile app

---

Built with Next.js 15 and Tailwind CSS
