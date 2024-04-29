import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { FmsService } from './fms.service';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { writeOrdersPolicy } from 'frontend/casl/casl.policies';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';

@Resolver()
@UseGuards(PoliciesGuard)
export class FmsResolver {
  constructor(private readonly fmsService: FmsService) {}

  @Mutation('addMMWJson')
  @CheckPolicies(writeOrdersPolicy)
  async addMMWJson(
    @Args() args: any,
    @UserMeInfo('userMe') user: any,
  ): Promise<any> {
    return await this.fmsService.addMMWJson(
      args.session_id,
      args.json_data,
      user.user_id,
    );
  }
}
