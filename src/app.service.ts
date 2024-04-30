import { Injectable } from '@nestjs/common';
import { LIB_VERSION } from 'version';

@Injectable()
export class AppService {
  getLandingPage(): string {
    return `Web API (Version ${LIB_VERSION}) Liquidity Lock. Only authorized users can access this API.`;
  }
}
