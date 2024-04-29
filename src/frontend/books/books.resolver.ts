import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { readSessionsPolicy } from 'frontend/casl/casl.policies';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { BooksService } from './books.service';
import { Book } from 'frontend/graphql.schema';

@Resolver()
@UseGuards(PoliciesGuard)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Query('getBook')
  @CheckPolicies(readSessionsPolicy)
  async getBook(@Args() args: any): Promise<Book> {
    return this.booksService.getBook(args.book_id);
  }
}
