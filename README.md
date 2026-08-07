# Questbook

Interactive workbooks for self-discovery, career direction, and personal positioning.

**Module 1:** The Architecture of You — Discover your hidden operating system through evidence-based questioning.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (free tier works)
- Stripe account (for subscription management)

### Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Create `.env` file** from `.env.example`
   ```bash
   cp .env.example .env
   ```

3. **Add your environment variables**
   - `VITE_SUPABASE_URL` — Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key
   - `VITE_STRIPE_PUBLISHABLE_KEY` — Your Stripe publishable key

4. **Set up Supabase database** — Run the SQL in `docs/supabase-schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Architecture

### Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payment:** Stripe (future)
- **CSS:** Tailwind + custom design system
- **PDF Export:** jsPDF + html2canvas

### Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Full page components (routes)
├── store/            # Zustand state management
├── hooks/            # Custom React hooks
├── lib/              # Utilities (Supabase client, etc.)
├── types/            # TypeScript types
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles
```

### Core Features

- ✓ User authentication (sign up, login, sign out)
- ✓ Quest progression (20 questions, 3 rounds)
- ✓ Real-time pattern detection
- ✓ Progress persistence
- ✓ Skills Canvas generation
- ✓ Version control (save multiple attempts)
- 🔄 PDF export (in progress)
- 🔄 Subscription/paywall (in progress)
- 🔄 Module 2+ (coming)

## Database Schema

See `docs/supabase-schema.sql` for the complete schema.

### Key Tables

- **users** — User profiles and subscription status
- **quests** — Quest metadata (title, description, module order)
- **quest_modules** — Module structure within each quest
- **questionnaires** — User responses and results
- **subscriptions** — Stripe subscription tracking

## Development

### Adding a New Question

Edit `src/pages/QuestPage.tsx` and add to `QUEST_QUESTIONS.questions` array.

### Extending Pattern Detection

The pattern detection logic is in `src/store/questStore.ts` in the `detectPatterns` method. Currently uses simple keyword extraction — can be enhanced with ML.

### Adding a New Module

1. Create a new quest in the database
2. Add module questions
3. Create a new page component (e.g., `QuestPage2.tsx`)
4. Wire up in routing
5. Add paywall logic

## Deployment

### Vercel (Frontend)

```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Supabase (Database)

Already hosted; no additional deployment needed.

## Next Steps

- [ ] PDF export functionality
- [ ] Stripe subscription integration
- [ ] Module 2: The Offer
- [ ] Email notifications
- [ ] Advanced pattern detection (ML-enhanced)
- [ ] Leaderboard/community features
- [ ] API documentation

## Support

For issues, contact support@questbook.app or check GitHub discussions.

---

**Created with ❤️ for multidisciplinary creators, founders, and career-changers.**
