import { Module } from '@nestjs/common';
import { FeSettingsResolver } from './fe-settings.resolver';
import { FeSettingsService } from './fe-settings.service';
import { CaslModule } from 'frontend/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [FeSettingsResolver, FeSettingsService]
})
export class FeSettingsModule {}
