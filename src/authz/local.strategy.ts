import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthzService } from './authz.service';
import { AppLogger } from 'common/logger/logger.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private readonly authzService: AuthzService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Called before a route is executed.
   *
   * @param {ExecutionContext} context
   * @returns {Promise<boolean>}
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('Running LocalAuthGuard');

    const ctx = GqlExecutionContext.create(context);

    const req = ctx.getContext().req;

    if (req.headers && req.headers.useremail) {
      this.logger.log(
        'Running LocalAuthGuard - inside the user email and header condition',
      );
      this.logger.log(
        `User Source. IP: ${req.ip}, Origin: ${req.headers.origin}`,
        req,
      );

      const userInfo = {
        email: req.headers.useremail,
      };

      this.logger.log(`Running LocalAuthGuard ${JSON.stringify(userInfo)}`);

      try {
        this.logger.log('Running LocalAuthGuard - Before validating user');
        req['user'] = await this.authzService.validateUser(userInfo);
        return true;
      } catch (error) {
        this.logger.error('Running LocalAuthGuard - User validation error');
        return false;
      }
    }
    return false;
  }
}
