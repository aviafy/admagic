import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthenticatedUser {
  userId: string;
  email?: string;
}

/**
 * Custom decorator to extract authenticated user from request
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Post('submit')
 * submitContent(@CurrentUser() user: AuthenticatedUser) {
 *   // Access authenticated user ID via user.userId
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
