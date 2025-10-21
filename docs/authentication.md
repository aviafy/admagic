# JWT Authentication Implementation

## Overview

Implemented JWT-based authentication to secure all content endpoints and prevent user impersonation attacks.

## Architecture

### Components

1. **JWT Strategy** - Validates tokens and extracts user info
2. **JWT Guard** - Protects routes requiring authentication
3. **CurrentUser Decorator** - Extracts authenticated user from request
4. **Auth Module** - Configures Passport.js and JWT

## Implementation

### 1. JWT Strategy

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret"),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
```

### 2. Securing Endpoints

```typescript
// src/modules/content/content.controller.ts
@Controller("content")
@UseGuards(JwtAuthGuard) // Protect all routes
export class ContentController {
  @Post("submit")
  async submitContent(
    @CurrentUser() user: AuthenticatedUser, // From token
    @Body() dto: SubmitContentDto
  ) {
    return this.service.submitContent(user.userId, dto);
  }
}
```

### 3. Removed userId from DTO

**Before (Vulnerable):**

```typescript
{
  "userId": "any-user-id-i-want",  // User impersonation!
  "contentType": "text",
  "contentText": "hello"
}
```

**After (Secure):**

```typescript
{
  "contentType": "text",
  "contentText": "hello"
}
// userId extracted from validated JWT token
```

## Configuration

### Environment Variables

```env
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=1d
```

### Validation

```typescript
// src/config/validation.schema.ts
JWT_SECRET: Joi.string().min(32).optional();
JWT_EXPIRES_IN: Joi.string().default("1d");
```

## Usage

### 1. Obtain Token from Supabase

```typescript
// Frontend: Using Supabase client
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

const token = data.session?.access_token;
```

### 2. Make Authenticated Request

```bash
curl -X POST http://localhost:3001/content/submit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "text",
    "contentText": "This is my content"
  }'
```

### 3. Error Handling

```json
// 401 Unauthorized - No token provided
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 401 Unauthorized - Invalid token
{
  "statusCode": 401,
  "message": "Invalid token payload"
}
```

## Security Benefits

1. **Prevents User Impersonation** - Users can't submit content as other users
2. **Stateless Authentication** - No server-side session storage needed
3. **Token Expiration** - Tokens expire after 1 day by default
4. **Supabase Integration** - Uses existing Supabase auth infrastructure
5. **Audit Trail** - All content submissions linked to verified user

## Testing

```bash
# Test without token (should fail)
curl -X POST http://localhost:3001/content/submit \
  -H "Content-Type: application/json" \
  -d '{"contentType":"text","contentText":"test"}'
# Expected: 401 Unauthorized

# Test with valid token (should succeed)
curl -X POST http://localhost:3001/content/submit \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"text","contentText":"test"}'
# Expected: 200 OK with submission data
```

## Migration Guide

### Frontend Changes Required

1. **Store Supabase session token**

```typescript
const token = session?.access_token;
```

2. **Add Authorization header to all API calls**

```typescript
const response = await fetch(`${API_URL}/content/submit`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(submitDto),
});
```

3. **Remove userId from request body** - It's now extracted from token

### Backend Changes

- ✅ All content endpoints now require authentication
- ✅ userId removed from DTOs
- ✅ User identity verified via JWT signature
- ✅ No breaking changes to response structure
