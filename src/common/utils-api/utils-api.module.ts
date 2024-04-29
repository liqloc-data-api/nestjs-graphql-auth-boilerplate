import { Module } from '@nestjs/common';
import { UtilsApiService } from './utils-api.service';
import { UtilsApiResolver } from './utils-api.resolver';

@Module({
  providers: [UtilsApiService, UtilsApiResolver]
})
export class UtilsApiModule {}
