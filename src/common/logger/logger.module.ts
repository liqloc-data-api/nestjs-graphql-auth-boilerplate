import { Module } from '@nestjs/common';
import { AppLogger } from './logger.service';
import { UserMeModule } from '../user-me/user-me.module';
import { UserMeService } from '../user-me/user-me.service';

@Module({
  imports: [UserMeModule],
  providers: [AppLogger, UserMeService]
})
export class LoggerModule {}
