import { Module } from '@nestjs/common';
import { DV01Scalar, DateYYYYMMDDScalar } from './custom-scalars/custom.scalar';
import { UserMeModule } from './user-me/user-me.module';
import { LoggerModule } from './logger/logger.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AppLogger } from './logger/logger.service';
import { UtilsApiModule } from './utils-api/utils-api.module';

@Module({
    providers: [DV01Scalar, DateYYYYMMDDScalar, LoggingInterceptor, AppLogger],
    exports: [DV01Scalar, DateYYYYMMDDScalar],
    imports: [UserMeModule, LoggerModule, UtilsApiModule]
})
export class CommonModule {}