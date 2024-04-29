import { Module } from '@nestjs/common';
import { SessionsResolver } from './sessions.resolver';
import { SessionsService } from './sessions.service';
import { CaslModule } from 'frontend/casl/casl.module';
import { DateYYYYMMDDScalar } from 'common/custom-scalars/custom.scalar';

@Module({
  imports: [CaslModule],
  providers: [SessionsResolver, SessionsService, DateYYYYMMDDScalar],
  exports: [SessionsService]
})
export class SessionsModule {}
