import { Module } from '@nestjs/common';
import { DemoOnlyService } from './demo-only.service';
import { DemoOnlyResolver } from './demo-only.resolver';
import { SessionsModule } from 'frontend/sessions/sessions.module';
import { SessionsService } from 'frontend/sessions/sessions.service';
import { CaslModule } from 'frontend/casl/casl.module';

@Module({
  imports: [SessionsModule, CaslModule],
  providers: [DemoOnlyService, DemoOnlyResolver]
})
export class DemoOnlyModule {}
