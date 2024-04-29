import { Module } from '@nestjs/common';
import { CASLAbilityFactory } from './casl-ability.factory';
import { CaslService } from './casl.service';
import { LoggerModule } from 'common/logger/logger.module';
import { AppLogger } from 'common/logger/logger.service';

@Module({
  imports: [LoggerModule],
  providers: [CASLAbilityFactory, CaslService, AppLogger],
  exports: [CASLAbilityFactory],
})
export class CaslModule {}
