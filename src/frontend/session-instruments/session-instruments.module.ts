import { Module } from '@nestjs/common';
import { SessionInstrumentsResolver } from './session-instruments.resolver';
import { SessionInstrumentsService } from './session-instruments.service';
import { CaslModule } from 'frontend/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [SessionInstrumentsResolver, SessionInstrumentsService],
  exports: [SessionInstrumentsService],
})
export class SessionInstrumentsModule {}
