import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SessionsModule } from 'modules/sessions/sessions.module';
import { UsersModule } from 'modules/users/users.module';
import { JwtStrategy } from './strategies/jwt.stategy';

@Module({
  imports: [
    SessionsModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'],
      signOptions: {
        expiresIn: process.env['JWT_EXPIRATION'],
      },
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthModule {}
