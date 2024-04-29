import { Module } from '@nestjs/common';
import { ExcelResolver } from './excel.resolver';
import { ExcelService } from './excel.service';
import { FeSettingsService } from 'frontend/fe-settings/fe-settings.service';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import { CaslModule } from 'frontend/casl/casl.module';
import { CurvesService } from 'frontend/curves/curves.service';
import { ParametersService } from 'frontend/parameters/parameters.service';
import { OrdersService } from 'frontend/orders/orders.service';
import { UsersService } from 'frontend/users/users.service';
import { SessionsService } from 'frontend/sessions/sessions.service';
import { BooksService } from 'frontend/books/books.service';
import { CaslService } from 'frontend/casl/casl.service';

@Module({
  imports: [CaslModule],
  providers: [
    CaslService,
    OrdersService,
    ParametersService,
    CurvesService,
    SessionInstrumentsService,
    FeSettingsService,
    ExcelResolver,
    ExcelService,
    UsersService,
    SessionsService,
    BooksService,
  ],
})
export class ExcelModule {}
