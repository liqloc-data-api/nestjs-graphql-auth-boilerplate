import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DemoOnlyService } from './demo-only.service';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import {
  readSessionsPolicy,
  writeDemoPolicy,
} from 'frontend/casl/casl.policies';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
@UseGuards(PoliciesGuard)
export class DemoOnlyResolver {
  constructor(private readonly demoOnlyService: DemoOnlyService) {}

  @Mutation('demoBookTraderInitiation')
  @CheckPolicies(writeDemoPolicy)
  async demoBookTraderInitiation(
    @Args() args: any,
    @UserMeInfo('userMe') user: any,
  ) {
    return this.demoOnlyService.demoBookTraderInitiation(
      args.session_id,
      args.email,
      args.trader_id,
      args.book_name,
      args.book_id,
      user.user_id,
    );
  }
}
