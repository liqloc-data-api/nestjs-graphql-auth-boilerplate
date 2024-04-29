import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FeSettingsService } from './fe-settings.service';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { readSessionsPolicy } from 'frontend/casl/casl.policies';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';
import { UserMe } from 'graphql.schema';

@Resolver()
@UseGuards(PoliciesGuard)
export class FeSettingsResolver {
  constructor(private readonly feSettingsService: FeSettingsService) {}

  @Query('getAllFeSettings')
  @CheckPolicies(readSessionsPolicy)
  async getAllFeSettings(
    @Args() args: any,
    @UserMeInfo('userMe') user: any,
  ): Promise<any> {
    return await this.feSettingsService.getAllFeSettings(
      args.session_id,
      args.book_id,
      user.user_id,
    );
  }

  @Query('getSessionFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async getSessionFeSettingsByTypeId(@Args() args: any): Promise<any> {
    return await this.feSettingsService.getSessionFeSettingsByTypeId(
      args.session_id,
      args.setting_type_id,
    );
  }

  @Query('getSessionBookFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async getSessionBookFeSettingsByTypeId(@Args() args: any): Promise<any> {
    return await this.feSettingsService.getSessionBookFeSettingsByTypeId(
      args.session_id,
      args.book_id,
      args.setting_type_id,
    );
  }

  @Query('getSessionUserFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async getSessionUserFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<any> {
    return await this.feSettingsService.getSessionUserFeSettingsByTypeId(
      args.session_id,
      user.user_id,
      args.setting_type_id,
    );
  }

  @Query('getSessionBookUserFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async getSessionBookUserFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<any> {
    return await this.feSettingsService.getSessionBookUserFeSettingsByTypeId(
      args.session_id,
      args.book_id,
      user.user_id,
      args.setting_type_id,
    );
  }

  @Mutation('addSessionBookFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async addSessionBookFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ) {
    return await this.feSettingsService.addSessionBookFeSettingsByTypeId(
      args.session_id,
      args.book_id,
      args.setting_type_id,
      args.setting_members,
      user.user_id,
    );
  }

  @Mutation('addSessionUserFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async addSessionUserFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ) {
    return await this.feSettingsService.addSessionUserFeSettingsByTypeId(
      args.session_id,
      user.user_id,
      args.setting_type_id,
      args.setting_members,
    );
  }

  @Mutation('addSessionBookUserFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async addSessionBookUserFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ) {
    return await this.feSettingsService.addSessionBookUserFeSettingsByTypeId(
      args.session_id,
      args.book_id,
      user.user_id,
      args.setting_type_id,
      args.setting_members,
    );
  }

  @Mutation('updateSessionBookFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async updateSessionBookTableFeSettings(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ) {
    return await this.feSettingsService.updateSessionBookFeSettingsByTypeId(
      args.session_id,
      args.book_id,
      args.setting_type_id,
      args.setting_members,
      user.user_id,
    );
  }

  @Mutation('updateSessionUserFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async updateSessionUserFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ) {
    return await this.feSettingsService.updateSessionUserFeSettingsByTypeId(
      args.session_id,
      user.user_id,
      args.setting_type_id,
      args.setting_members,
    );
  }

  @Mutation('updateSessionBookUserFeSettingsByTypeId')
  @CheckPolicies(readSessionsPolicy)
  async updateSessionBookUserFeSettingsByTypeId(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ) {
    return await this.feSettingsService.updateSessionBookUserFeSettingsByTypeId(
      args.session_id,
      args.book_id,
      user.user_id,
      args.setting_type_id,
      args.setting_members,
    );
  }
}
