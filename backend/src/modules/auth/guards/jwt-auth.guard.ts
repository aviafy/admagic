import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * Protects routes by requiring a valid JWT token
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * getProtectedResource() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Call parent guard which validates JWT
    return super.canActivate(context);
  }
}
