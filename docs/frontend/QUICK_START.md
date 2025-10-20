# Frontend Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Backend API running on port 3001

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your credentials
```

## Environment Configuration

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

## Project Structure Overview

```
src/
├── app/              # Pages and layouts
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   └── content/     # Content moderation
├── shared/          # Reusable code
│   ├── components/  # UI components
│   ├── types/       # TypeScript types
│   └── utils/       # Helper functions
└── config/          # Configuration
```

## Common Tasks

### Adding a New Component

```typescript
// src/shared/components/NewComponent.tsx
'use client';

interface NewComponentProps {
  title: string;
}

export function NewComponent({ title }: NewComponentProps) {
  return <div>{title}</div>;
}

// Export from src/shared/components/index.ts
export { NewComponent } from './NewComponent';

// Use in your feature
import { NewComponent } from '@/shared/components';
```

### Creating a Custom Hook

```typescript
// src/features/content/hooks/useNewFeature.ts
'use client';

import { useState } from 'react';

export function useNewFeature() {
  const [state, setState] = useState(null);

  const doSomething = () => {
    // Logic here
  };

  return { state, doSomething };
}

// Export from feature index
export { useNewFeature } from './hooks/useNewFeature';

// Use in component
import { useNewFeature } from '@/features/content';

const { state, doSomething } = useNewFeature();
```

### Adding a Service Method

```typescript
// src/features/content/services/contentService.ts
class ContentService {
  async newMethod(data: any) {
    const response = await fetch(`${API_BASE_URL}/new-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

## Import Paths

Use TypeScript path aliases for clean imports:

```typescript
// ✅ Good
import { Button } from '@/shared/components';
import { useAuth } from '@/features/auth';
import { API_BASE_URL } from '@/config/constants';

// ❌ Bad
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Testing the Application

### 1. Test Authentication

- Open http://localhost:3000
- Click "Create an account"
- Enter email and password (min 6 chars)
- Should see success message

### 2. Test Content Submission

- After logging in
- Enter some text in the form
- Click "Submit for Moderation"
- Watch for AI analysis results

### 3. Test Different Content Types

**Safe content**:
```
"Hello! This is a friendly message about technology."
```

**Flagged content**:
```
"This is terrible and you're stupid for thinking otherwise."
```

**Harmful content**:
```
"I will hurt you and your family."
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Type Errors

```bash
# Restart TypeScript server in VSCode
CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"
```

### Environment Variables Not Working

- Make sure `.env.local` exists
- Restart dev server after changes
- Variables must start with `NEXT_PUBLIC_`

## Useful Commands

```bash
# Clear Next.js cache
rm -rf .next

# Check for updates
npm outdated

# Update dependencies
npm update

# Format code (if Prettier is installed)
npx prettier --write "src/**/*.{ts,tsx}"
```

## Next Steps

1. Read [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) for detailed architecture info
2. Explore the code in `src/features/`
3. Try adding a new feature
4. Customize the UI components

## Getting Help

- Check browser console for errors
- Review Network tab for API issues
- Check backend logs if API calls fail
- Read the architecture documentation

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to configure environment variables
```

### Environment Variables for Production

Add these in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (your production backend URL)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
