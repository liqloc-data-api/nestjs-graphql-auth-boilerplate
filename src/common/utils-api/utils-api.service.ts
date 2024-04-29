import { Injectable } from '@nestjs/common';
import { LIB_VERSION } from '../../version';

@Injectable()
export class UtilsApiService {
  getVersion(): string {
    return `Version ${LIB_VERSION}`;
  }
}
