import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { CurvesService } from './curves.service';
import {
  readCurvesPolicy,
  uploadCurvesPolicy,
  writeCurvesPolicy,
} from 'frontend/casl/casl.policies';
import {
  AddMutationResponse,
  DeleteMutationResponse,
  SessionCurve,
} from 'frontend/graphql.schema';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';
import { UserMe } from 'graphql.schema';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
@UseGuards(PoliciesGuard)
export class CurvesResolver {
  constructor(private readonly curvesService: CurvesService) {}

  @Query('getSessionCurves')
  @CheckPolicies(readCurvesPolicy)
  async getSessionCurves(@Args() args: any): Promise<SessionCurve[]> {
    return this.curvesService.getSessionCurves(
      args.session_id,
      args.book_id,
      args.trader_id,
    );
  }

  @Query('getSessionCurveById')
  @CheckPolicies(readCurvesPolicy)
  async getSessionCurveById(@Args() args: any): Promise<SessionCurve> {
    return this.curvesService.getSessionCurveById(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.curve_id,
    );
  }

  @Mutation('deleteSessionCurves')
  @CheckPolicies(writeCurvesPolicy)
  async deleteSessionCurves(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.curvesService.deleteSessionCurves(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.curve_ids,
      user.user_id,
    );
  }

  @Mutation('deleteSessionCurvesRateAdj')
  @CheckPolicies(writeCurvesPolicy)
  async deleteSessionCurvesRateAdj(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.curvesService.deleteSessionCurvesRateAdj(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.curve_ids,
      user.user_id,
    );
  }

  @Mutation('addSessionCurve')
  @CheckPolicies(writeCurvesPolicy)
  async addSessionCurve(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.curvesService.addSessionCurve(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.instrument_id,
      args.curve_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateSessionCurve')
  @CheckPolicies(writeCurvesPolicy)
  async updateSessionCurve(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.curvesService.updateSessionCurve(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.curve_id,
      args.curve_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateMultiSessionCurves')
  @CheckPolicies(writeCurvesPolicy)
  async updateMultiSessionCurve(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.curvesService.updateMultiSessionCurves(
      args.session_id,
      args.book_id,
      args.trader_id,
      user.user_id,
      args.session_curves,
    );
  }

  @Mutation('deleteSessionCurvesCustomColumn')
  @CheckPolicies(writeCurvesPolicy)
  async deleteSessionCurvesCustomColumn(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.curvesService.deleteSessionCurvesCustomColumn(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.column_name,
      user.user_id,
    );
  }

  @Mutation('deleteAllSessionCurves')
  @CheckPolicies(uploadCurvesPolicy)
  async deleteAllSessionCurves(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.curvesService.deleteAllSessionCurves(
      args.session_id,
      args.book_id,
      args.trader_id,
      user.user_id,
    );
  }
}
