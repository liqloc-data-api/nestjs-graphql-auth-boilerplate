import { Module } from '@nestjs/common';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';
import { CaslModule } from 'frontend/casl/casl.module';
import { SessionInstrumentsModule } from 'frontend/session-instruments/session-instruments.module';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';

@Module({
  imports: [SessionInstrumentsModule, CaslModule],
  providers: [OrdersResolver, OrdersService, SessionInstrumentsService],
})
export class OrdersModule {}
