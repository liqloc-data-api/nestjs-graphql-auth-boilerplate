import { Module } from '@nestjs/common';
import { CaslModule } from './casl/casl.module';
import { ParametersModule } from './parameters/parameters.module';
import { CurvesModule } from './curves/curves.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import { OrdersModule } from './orders/orders.module';
import { DemoOnlyModule } from './demo-only/demo-only.module';
import { FeSettingsModule } from './fe-settings/fe-settings.module';
import { BusinessParsersModule } from './business-parsers/business-parsers.module';
import { SessionInstrumentsModule } from './session-instruments/session-instruments.module';
import { ExcelModule } from './excel/excel.module';
import { BooksModule } from './books/books.module';
import { FmsModule } from './fms/fms.module';

@Module({
  imports: [
    CaslModule,
    ParametersModule,
    CurvesModule,
    UsersModule,
    SessionsModule,
    OrdersModule,
    DemoOnlyModule,
    FeSettingsModule,
    BusinessParsersModule,
    SessionInstrumentsModule,
    ExcelModule,
    BooksModule,
    FmsModule,
  ],
  providers: [CaslModule],
  exports: [],
})
export class FrontendModule {}
