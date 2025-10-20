# Frontend - AI Content Moderator

Modern Next.js 15 frontend with TypeScript, featuring a clean feature-based architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

📚 **Read these guides for detailed information:**

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running quickly
- **[FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)** - Complete architecture guide
- **[FRONTEND_REFACTORING_COMPLETE.md](../FRONTEND_REFACTORING_COMPLETE.md)** - Refactoring summary

## Project Structure

```
src/
├── app/              # Next.js pages
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   └── content/     # Content moderation
├── shared/          # Reusable code
│   ├── components/  # UI components
│   ├── types/       # TypeScript types
│   └── utils/       # Helper functions
└── config/          # Configuration
```

## Key Features

- ✅ **Feature-Based Architecture**: Organized by domain
- ✅ **TypeScript**: Full type safety
- ✅ **Custom Hooks**: Reusable logic
- ✅ **Service Layer**: Centralized API calls
- ✅ **Shared Components**: Reusable UI elements
- ✅ **Clean Imports**: Path aliases (@/...)
- ✅ **Well Documented**: Comprehensive guides

## Technology Stack

- **Next.js 15**: React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Supabase**: Authentication & database
- **React Hooks**: Modern React patterns

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Architecture Highlights

### Feature-Based Organization

Each feature is self-contained:

```
features/auth/
├── components/    # UI elements
├── hooks/         # Custom hooks
├── services/      # API logic
├── types/         # TypeScript types
└── index.ts       # Public API
```

### Clean Imports

```typescript
// Import from features
import { AuthForm, useAuth } from '@/features/auth';
import { ContentForm } from '@/features/content';

// Import shared components
import { Button, Input } from '@/shared/components';

// Import config
import { API_BASE_URL } from '@/config/constants';
```

### Type Safety

All data structures are fully typed:

```typescript
interface User {
  id: string;
  email: string;
}

interface ContentSubmission {
  id: string;
  status: ContentStatus;
  aiDecision?: AiDecision;
}
```

## Development Workflow

### 1. Create Feature

```bash
mkdir -p src/features/new-feature/{components,hooks,services,types}
```

### 2. Add Types

```typescript
// src/features/new-feature/types/index.ts
export interface NewFeatureData {
  id: string;
  name: string;
}
```

### 3. Create Service

```typescript
// src/features/new-feature/services/newFeatureService.ts
class NewFeatureService {
  async getData() {
    // API logic
  }
}

export const newFeatureService = new NewFeatureService();
```

### 4. Create Hook

```typescript
// src/features/new-feature/hooks/useNewFeature.ts
export function useNewFeature() {
  const [data, setData] = useState(null);
  // Hook logic
  return { data };
}
```

### 5. Create Component

```typescript
// src/features/new-feature/components/NewFeature.tsx
export function NewFeature() {
  const { data } = useNewFeature();
  return <div>{data}</div>;
}
```

### 6. Export

```typescript
// src/features/new-feature/index.ts
export { NewFeature } from './components/NewFeature';
export { useNewFeature } from './hooks/useNewFeature';
export { newFeatureService } from './services/newFeatureService';
export type * from './types';
```

## Testing

```bash
# Run tests (when configured)
npm test

# Run type checking
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Other Platforms

```bash
npm run build
npm run start
```

Don't forget to set environment variables in your hosting platform!

## Troubleshooting

### Module Not Found
- Check tsconfig.json paths
- Restart dev server
- Clear .next cache

### Type Errors
- Run `npx tsc --noEmit`
- Check imports are correct
- Restart TypeScript server in IDE

### Authentication Issues
- Check Supabase credentials
- Disable email confirmation in Supabase
- Check browser console

## Contributing

1. Follow the existing architecture
2. Add types for all new code
3. Use shared components when possible
4. Document new features
5. Test before committing

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## Support

- Read the documentation in this folder
- Check the main project README
- Review the architecture guide

---

Built with ❤️ using Next.js, TypeScript, and modern React patterns
