import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GqlAuthGuard } from './gqlAuth.guard';
import { AuthzService } from './authz.service';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from 'common/common.module';
import { UserMeService } from 'common/user-me/user-me.service';
import { LoggerModule } from 'common/logger/logger.module';
import { AppLogger } from 'common/logger/logger.service';
import { LocalAuthGuard } from './local.strategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
    CommonModule,
    LoggerModule,
  ],
  providers: [JwtStrategy, GqlAuthGuard, LocalAuthGuard, AuthzService, UserMeService, AppLogger],
  exports: [PassportModule],
})
export class AuthzModule {}
