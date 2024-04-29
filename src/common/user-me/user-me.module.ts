import { Module } from '@nestjs/common';
import { UserMeService } from './user-me.service';

@Module({
  providers: [UserMeService]
})
export class UserMeModule {}
