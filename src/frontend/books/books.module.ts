import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { CaslModule } from 'frontend/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [BooksResolver, BooksService],
  exports: [BooksService]
})
export class BooksModule {}
