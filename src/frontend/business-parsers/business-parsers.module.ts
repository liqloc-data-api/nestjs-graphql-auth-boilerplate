import { Module } from '@nestjs/common';
import { BusinessParsersResolver } from './business-parsers.resolver';
import { BusinessParsersService } from './business-parsers.service';
import { OrdersService } from 'frontend/orders/orders.service';
import { ParametersService } from 'frontend/parameters/parameters.service';
import { SessionsService } from 'frontend/sessions/sessions.service';
import { CaslModule } from 'frontend/casl/casl.module';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import { FeSettingsService } from 'frontend/fe-settings/fe-settings.service';
import { CurvesService } from 'frontend/curves/curves.service';

@Module({
  imports: [CaslModule],
  providers: [
    BusinessParsersResolver,
    BusinessParsersService,
    SessionsService,
    SessionInstrumentsService,
    FeSettingsService,
    OrdersService,
    ParametersService,
    CurvesService,
  ],
})
export class BusinessParsersModule {}
