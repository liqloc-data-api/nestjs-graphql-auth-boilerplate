import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { BusinessParsersService } from './business-parsers.service';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import {
  readLimitsPolicy,
  readOrdersPolicy,
  writeLimitsPolicy,
  writeOrdersPolicy,
} from 'frontend/casl/casl.policies';
import {
  AddMutationResponse,
  RelativeDateLimitMembersOutput,
  SingleMaturityLimitImplied,
  UserMe,
} from 'frontend/graphql.schema';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';

@Resolver()
@UseGuards(PoliciesGuard)
export class BusinessParsersResolver {
  constructor(
    private readonly businessParsersService: BusinessParsersService,
  ) {}

  @Query('getMaturityMapper')
  @CheckPolicies(readOrdersPolicy, readLimitsPolicy)
  async getMaturityMapper(@Args() args: any): Promise<any> {
    return this.businessParsersService.getMaturityMapper(
      args.session_id,
      args.book_id,
      args.trader_id,
    );
  }

  @Mutation('addMMWOrdersParams')
  @CheckPolicies(writeOrdersPolicy, writeLimitsPolicy)
  async addMMWOrdersParams(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.businessParsersService.addMMWOrdersParams(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.mmw_json,
      user.user_id,
    );
  }

  @Query('getImpliedSMLimits')
  @CheckPolicies(readLimitsPolicy, readOrdersPolicy)
  async getImpliedSMLimits(
    @Args() args: any,
  ): Promise<SingleMaturityLimitImplied[]> {
    return this.businessParsersService.getImpliedSMLimits(
      args.session_id,
      args.book_id,
    );
  }

  @Query('getImpliedRDRLimits')
  @CheckPolicies(readLimitsPolicy, readOrdersPolicy)
  async getImpliedRDRLimits(
    @Args() args: any,
  ): Promise<RelativeDateLimitMembersOutput> {
    return this.businessParsersService.getImpliedRDRLimits(
      args.session_id,
      args.book_id,
    );
  }

  @Mutation('addImpliedLimits')
  @CheckPolicies(writeLimitsPolicy)
  async addImpliedLimits(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.businessParsersService.addImpliedLimits(
      args.session_id,
      args.book_id,
      user.user_id,
    );
  }
}
