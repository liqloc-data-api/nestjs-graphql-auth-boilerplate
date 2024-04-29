import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';
import { User, UserMe, UserMePermissions } from '../graphql.schema';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { readMePolicy, readSessionsPolicy } from '../casl/casl.policies';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';

@Resolver('User')
@UseGuards(PoliciesGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query('userMePermissions')
  @CheckPolicies(readMePolicy)
  async getUserMePermissions(
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<UserMePermissions> {
    return this.usersService.getFeUserMePermissions(user);
  }

  @Query('getUser')
  @CheckPolicies(readSessionsPolicy)
  async getUser(@Args() args: any): Promise<User> {
    return this.usersService.getUser(args.trader_id);
  }
}
