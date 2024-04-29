import { Query, Resolver } from '@nestjs/graphql';
import { UtilsApiService } from './utils-api.service';

@Resolver()
export class UtilsApiResolver {
  constructor(private readonly utilsAPIService: UtilsApiService) {}

  @Query('getVersion')
  async getVersion(): Promise<string> {
    return this.utilsAPIService.getVersion();
  }
}
