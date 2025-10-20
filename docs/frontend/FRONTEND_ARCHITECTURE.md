# Frontend Architecture Documentation

## Overview

This Next.js 15 frontend follows modern best practices with a feature-based architecture, TypeScript for type safety, and a clean separation of concerns.

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Authentication and database client
- **Custom Hooks**: Reusable stateful logic

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── components/          # Auth-specific components
│   │   │   │   └── AuthForm.tsx
│   │   │   ├── hooks/               # Auth custom hooks
│   │   │   │   └── useAuth.tsx
│   │   │   ├── services/            # Auth business logic
│   │   │   │   └── authService.ts
│   │   │   ├── types/               # Auth TypeScript types
│   │   │   │   └── index.ts
│   │   │   └── index.ts             # Feature barrel export
│   │   │
│   │   └── content/                 # Content moderation feature
│   │       ├── components/
│   │       │   ├── ContentForm.tsx
│   │       │   └── ModerationResult.tsx
│   │       ├── hooks/
│   │       │   └── useContentSubmission.ts
│   │       ├── services/
│   │       │   └── contentService.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── shared/                       # Shared/common code
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Alert.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   ├── types/                   # Shared TypeScript types
│   │   │   └── index.ts
│   │   └── utils/                   # Utility functions
│   │       ├── format.ts
│   │       └── validation.ts
│   │
│   └── config/                       # Configuration files
│       ├── constants.ts             # App constants
│       └── supabase.ts              # Supabase client config
│
├── components/                       # (Legacy - can be removed)
├── contexts/                         # (Legacy - can be removed)
├── lib/                             # (Legacy - can be removed)
├── public/                          # Static assets
├── .env.local                       # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Architecture Principles

### 1. Feature-Based Organization

Each feature is self-contained with its own:
- **Components**: UI elements specific to the feature
- **Hooks**: Custom React hooks for stateful logic
- **Services**: Business logic and API calls
- **Types**: TypeScript interfaces and types
- **Index**: Barrel export for clean imports

**Benefits**:
- Easy to locate code
- Clear ownership
- Simple to add/remove features
- Better code splitting

### 2. Separation of Concerns

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│         (Components / UI)               │
├─────────────────────────────────────────┤
│           Business Logic Layer          │
│         (Hooks / Services)              │
├─────────────────────────────────────────┤
│              Data Layer                 │
│         (API calls / Supabase)          │
└─────────────────────────────────────────┘
```

### 3. Component Categories

#### Feature Components
Located in `src/features/{feature}/components/`
- Specific to a feature
- Can use feature hooks and services
- Example: `AuthForm.tsx`, `ContentForm.tsx`

#### Shared Components
Located in `src/shared/components/`
- Reusable across features
- No feature-specific logic
- Example: `Button.tsx`, `Input.tsx`, `Alert.tsx`

### 4. Custom Hooks Pattern

Custom hooks encapsulate stateful logic:

```typescript
// Example: useContentSubmission hook
export function useContentSubmission() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ContentStatusResponse | null>(null);

  const submitContent = async (data: SubmitContentDto) => {
    // Logic here
  };

  return { submissionId, status, submitContent };
}
```

**Benefits**:
- Reusable logic
- Easier testing
- Cleaner components

### 5. Service Layer Pattern

Services handle all API communication:

```typescript
// Example: authService
class AuthService {
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    // API call logic
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    // API call logic
  }
}

export const authService = new AuthService();
```

**Benefits**:
- Centralized API logic
- Easy to mock for testing
- Single source of truth

### 6. Type Safety

All data structures are typed:

```typescript
// Shared types
export interface User {
  id: string;
  email: string;
}

// Feature-specific types
export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}
```

## Key Patterns

### Barrel Exports

Each feature has an `index.ts` that exports public APIs:

```typescript
// src/features/auth/index.ts
export { AuthForm } from './components/AuthForm';
export { AuthProvider, useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
export type * from './types';
```

**Usage**:
```typescript
// Clean imports
import { AuthForm, useAuth, authService } from '@/features/auth';

// Instead of:
import { AuthForm } from '@/features/auth/components/AuthForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/authService';
```

### Context Providers

Authentication context wraps the entire app:

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### Path Aliases

TypeScript configured with path aliases for clean imports:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage**:
```typescript
import { Button } from '@/shared/components';
import { AuthForm } from '@/features/auth';
import { API_BASE_URL } from '@/config/constants';
```

## Data Flow

### Authentication Flow

```
1. User fills AuthForm
2. AuthForm calls authService.signUp/signIn
3. authService communicates with Supabase
4. Supabase updates auth state
5. useAuth hook detects change
6. App re-renders with user data
```

### Content Submission Flow

```
1. User fills ContentForm
2. ContentForm calls useContentSubmission hook
3. Hook calls contentService.submitContent
4. Service sends POST to backend API
5. Backend returns submissionId
6. Hook triggers polling for status
7. ModerationResult displays updates
```

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Constants

Centralized in `src/config/constants.ts`:

```typescript
export const APP_NAME = 'AI Content Moderator';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const MIN_PASSWORD_LENGTH = 6;
export const POLL_INTERVAL_MS = 2000;
```

## Best Practices

### 1. Component Organization

```typescript
// ✅ Good: Clean, focused component
export function Button({ children, loading, ...props }: ButtonProps) {
  return (
    <button disabled={loading} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ❌ Bad: Mixed concerns
export function Button({ children, onClick }) {
  const [data, setData] = useState();

  useEffect(() => {
    fetch('/api/data').then(setData); // Don't do this
  }, []);

  return <button onClick={onClick}>{children}</button>;
}
```

### 2. Custom Hooks

```typescript
// ✅ Good: Reusable hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage
const { user, loading } = useAuth();
```

### 3. Type Safety

```typescript
// ✅ Good: Fully typed
export function ContentForm({ userId, onSubmissionCreated }: ContentFormProps) {
  const [contentType, setContentType] = useState<ContentType>('text');
  // ...
}

// ❌ Bad: No types
export function ContentForm({ userId, onSubmissionCreated }) {
  const [contentType, setContentType] = useState('text');
  // ...
}
```

### 4. Error Handling

```typescript
// ✅ Good: Proper error handling
try {
  const response = await contentService.submitContent(data);
  setSubmissionId(response.submissionId);
} catch (err: any) {
  setError(err.message);
  console.error('Submission error:', err);
}

// ❌ Bad: Silent failures
const response = await contentService.submitContent(data);
setSubmissionId(response.submissionId);
```

## Testing Strategy

### Unit Tests
- Test utility functions in `src/shared/utils/`
- Test services independently
- Test hooks with React Testing Library

### Integration Tests
- Test feature flows end-to-end
- Test component interactions
- Test API integration

### E2E Tests
- Test complete user journeys
- Test authentication flow
- Test content submission flow

## Migration from Legacy Structure

If you have old files in `components/`, `lib/`, or `contexts/`:

1. Move auth components → `src/features/auth/components/`
2. Move content components → `src/features/content/components/`
3. Move shared components → `src/shared/components/`
4. Move utility functions → `src/shared/utils/`
5. Update imports to use new paths
6. Delete old directories

## Performance Optimization

### Code Splitting
- Features are automatically code-split by Next.js
- Use dynamic imports for heavy components

### Memoization
```typescript
const MemoizedComponent = memo(ExpensiveComponent);
```

### Lazy Loading
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

## Adding New Features

1. Create feature directory: `src/features/new-feature/`
2. Add subdirectories: `components/`, `hooks/`, `services/`, `types/`
3. Create `index.ts` barrel export
4. Add types to `types/index.ts`
5. Implement components
6. Create custom hooks
7. Add service layer
8. Export from `index.ts`

## Troubleshooting

### Path alias not working
- Check `tsconfig.json` paths configuration
- Restart TypeScript server in VSCode
- Run `npm run dev` again

### Component not rendering
- Check AuthProvider is wrapping app
- Verify imports are correct
- Check browser console for errors

### Type errors
- Run `npm run type-check` (if configured)
- Check TypeScript errors in IDE
- Ensure all types are exported properly

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Conclusion

This architecture provides:
- ✅ Clear structure
- ✅ Easy maintenance
- ✅ Type safety
- ✅ Scalability
- ✅ Testability
- ✅ Developer experience
