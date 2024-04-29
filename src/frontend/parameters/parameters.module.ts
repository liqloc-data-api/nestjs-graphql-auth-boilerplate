import { Module } from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { ParametersResolver } from './parameters.resolver';
import { DV01Scalar } from 'common/custom-scalars/custom.scalar';
import { CaslModule } from 'frontend/casl/casl.module';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import { SessionInstrumentsModule } from 'frontend/session-instruments/session-instruments.module';

@Module({
  imports: [SessionInstrumentsModule, CaslModule],
  providers: [
    ParametersService,
    ParametersResolver,
    DV01Scalar,
    SessionInstrumentsService,
  ],
})
export class ParametersModule {}
