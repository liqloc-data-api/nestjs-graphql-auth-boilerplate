import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { CaslModule } from '../casl/casl.module';
import { CaslService } from '../casl/casl.service';

@Module({
  imports: [CaslModule],
  providers: [UsersService, UsersResolver, CaslService]
})
export class UsersModule {}
