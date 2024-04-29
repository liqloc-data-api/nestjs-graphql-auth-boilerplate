import { Module } from '@nestjs/common';
import { CurvesService } from './curves.service';
import { CurvesResolver } from './curves.resolver';
import { CaslModule } from 'frontend/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [CurvesResolver, CurvesService]
})
export class CurvesModule {}
