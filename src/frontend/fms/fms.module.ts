import { Module } from '@nestjs/common';
import { FmsResolver } from './fms.resolver';
import { FmsService } from './fms.service';
import { CaslModule } from 'frontend/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [FmsResolver, FmsService],
})
export class FmsModule {}
