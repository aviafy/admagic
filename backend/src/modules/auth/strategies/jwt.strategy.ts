import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // User ID (subject)
  email?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * JWT Strategy for validating JWT tokens
 * Extracts and validates JWT from Authorization header
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'default-secret-change-in-production',
    });
  }

  /**
   * Validate JWT payload
   * This method is called automatically after token is verified
   * The returned value will be attached to req.user
   */
  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return user object that will be attached to request
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
