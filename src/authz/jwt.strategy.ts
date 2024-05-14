import { AUTH0_AUDIENCE, AUTH0_ISSUER_URL } from 'environments';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthzService } from './authz.service';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { AppLogger } from 'common/logger/logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authzService: AuthzService,
    private readonly logger: AppLogger,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 100,
        jwksUri: `${AUTH0_ISSUER_URL}.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: AUTH0_AUDIENCE,
      issuer: AUTH0_ISSUER_URL,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
    this.logger.setContext(JwtStrategy.name);
  }

  /**
   * Method that returns the user info from the access token and the userMe from the database
   * @param req  Request
   * @returns  updates context with the user info and userMe
   */
  async validate(req: Request) {
    // Check if the authorization header exists
    if (req.headers && req.headers.authorization) {
      this.logger.log(
        `User Source. IP: ${req.ip}, Origin: ${req.headers.origin}`,
        req,
      );
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader.split(' ');
      console.log(bearerToken.toString(), 'btoken');
      // Check if the Authorization header is a Bearer token
      if (bearerToken.length === 2) {
        const accessToken = bearerToken[1];

        // Fetch the user info using the access token
        const userInfo = await firstValueFrom(
          this.authzService.getUserInfo(accessToken),
        );
        console.log(userInfo, 'userInfo');
        try {
          console.log('we are trying to validate user');
          return await this.authzService.validateUser(userInfo);
        } catch (error) {
          console.log('we are in error', JSON.stringify(error));
          throw new UnauthorizedException('Invalid user');
        }

        //TODO: check if user is active && verified && email_verified
      }
    }
    this.logger.error(`No authorization header`);
    throw new UnauthorizedException('Invalid token');
  }
}
