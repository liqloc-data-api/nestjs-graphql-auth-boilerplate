import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParametersService } from './parameters.service';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';
import {
  readLimitsPolicy,
  uploadLimitsPolicy,
  writeLimitsPolicy,
} from '../casl/casl.policies';
import {
  AddMutationResponse,
  DeleteMutationResponse,
  SessionLimit,
} from 'frontend/graphql.schema';
import { UserMe } from 'graphql.schema';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
@UseGuards(PoliciesGuard)
export class ParametersResolver {
  constructor(private readonly ParametersService: ParametersService) {}

  @Query('getSessionParametersByParameterTypes')
  @CheckPolicies(readLimitsPolicy)
  async getSessionParametersByParameterTypes(
    @Args() args: any,
  ): Promise<SessionLimit[]> {
    return this.ParametersService.getSessionParametersByParameterTypes(
      args.book_id,
      args.trader_id,
      args.session_id,
      args.parameter_type_ids,
    );
  }

  @Query('getSessionParameterById')
  @CheckPolicies(readLimitsPolicy)
  async getSessionParameterById(@Args() args: any): Promise<SessionLimit> {
    return this.ParametersService.getSessionParameterById(
      args.book_id,
      args.trader_id,
      args.session_id,
      args.parameter_id,
    );
  }

  @Mutation('addSingleMaturityLimit')
  @CheckPolicies(writeLimitsPolicy)
  async addSingleMaturityLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addSingleMaturityLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addSingleMaturityLimits')
  @CheckPolicies(writeLimitsPolicy)
  async addSingleMaturityLimits(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addSingleMaturityLimits(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members_array,
      user.user_id,
    );
  }

  @Mutation('updateSingleMaturityLimit')
  @CheckPolicies(writeLimitsPolicy)
  async updateSingleMaturityLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateSingleMaturityLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addSingleMaturityLimitSetting')
  @CheckPolicies(writeLimitsPolicy)
  async addSingleMaturityLimitSetting(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addSingleMaturityLimitSetting(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('updateSingleMaturityLimitSetting')
  @CheckPolicies(writeLimitsPolicy)
  async updateSingleMaturityLimitSetting(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateSingleMaturityLimitSetting(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('addDateRangeLimit')
  @CheckPolicies(writeLimitsPolicy)
  async addDateRangeLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addDateRangeLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateDateRangeLimit')
  @CheckPolicies(writeLimitsPolicy)
  async updateDateRangeLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateDateRangeLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addRelativeDateLimit')
  @CheckPolicies(writeLimitsPolicy)
  async addRelativeDateLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addRelativeDateLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('updateRelativeDateLimit')
  @CheckPolicies(writeLimitsPolicy)
  async updateRelativeDateLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateRelativeDateLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('addRelativeDateLimitSetting')
  @CheckPolicies(writeLimitsPolicy)
  async addRelativeDateLimitSetting(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addRelativeDateLimitSetting(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('updateRelativeDateLimitSetting')
  @CheckPolicies(writeLimitsPolicy)
  async updateRelativeDateLimitSetting(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateRelativeDateLimitSetting(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('addLiquidInstruments')
  @CheckPolicies(writeLimitsPolicy)
  async addLiquidInstruments(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addLiquidInstruments(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('updateLiquidInstruments')
  @CheckPolicies(writeLimitsPolicy)
  async updateLiquidInstruments(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateLiquidInstruments(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('addOtherParameters')
  @CheckPolicies(writeLimitsPolicy)
  async addOtherParameters(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addOtherParameters(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_detail_list,
      user.user_id,
    );
  }

  @Mutation('updateOtherParameters')
  @CheckPolicies(readLimitsPolicy)
  async updateOtherParameters(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateOtherParameters(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_detail_list,
      user.user_id,
    );
  }

  @Mutation('addDlNetDV01RangeLimit')
  @CheckPolicies(writeLimitsPolicy)
  async addDlNetDV01RangeLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.addDlNetDV01RangeLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('updateDlNetDV01RangeLimit')
  @CheckPolicies(writeLimitsPolicy)
  async updateDlNetDV01RangeLimit(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ParametersService.updateDlNetDV01RangeLimit(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_id,
      args.parameter_members,
      user.user_id,
    );
  }

  @Mutation('deleteSessionParametersCustomColumn')
  @CheckPolicies(writeLimitsPolicy)
  async deleteSessionParametersCustomColumn(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ParametersService.deleteSessionParametersCustomColumn(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_type_id,
      args.column_name,
      user.user_id,
    );
  }

  @Mutation('deleteSessionParameters')
  @CheckPolicies(writeLimitsPolicy)
  async deleteSessionParameters(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ParametersService.deleteSessionParameters(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_ids,
      user.user_id,
    );
  }

  @Mutation('deleteAllSessionParametersByTypeIds')
  @CheckPolicies(uploadLimitsPolicy)
  async deleteAllSessionParametersByTypeIds(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ParametersService.deleteAllSessionParametersByTypeIds(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.parameter_type_ids,
      user.user_id,
    );
  }
}
