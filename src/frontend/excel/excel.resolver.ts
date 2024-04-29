import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { ExcelService } from './excel.service';
import {
  downloadCurvesPolicy,
  downloadLimitsPolicy,
  downloadOrdersPolicy,
  uploadCurvesPolicy,
  uploadLimitsPolicy,
  uploadOrdersPolicy,
} from 'frontend/casl/casl.policies';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { UseGuards } from '@nestjs/common';
import { AddMutationResponse, UserMe } from 'frontend/graphql.schema';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';

@Resolver()
@UseGuards(PoliciesGuard)
export class ExcelResolver {
  constructor(private readonly excelService: ExcelService) {}

  @Query('getExcelCurveTemplate')
  @CheckPolicies(downloadCurvesPolicy)
  async getExcelCurveTemplate(@Args() args: any): Promise<string> {
    return this.excelService.getExcelCurve(
      args.session_id,
      args.book_id,
      args.trader_id,
      false,
    );
  }

  @Query('getExcelCurveData')
  @CheckPolicies(downloadCurvesPolicy)
  async getExcelCurveData(@Args() args: any): Promise<string> {
    return this.excelService.getExcelCurve(
      args.session_id,
      args.book_id,
      args.trader_id,
      true,
    );
  }

  @Query('getExcelDeltaLadderTemplate')
  @CheckPolicies(downloadOrdersPolicy)
  async getExcelDeltaLadderTemplate(@Args() args: any): Promise<string> {
    return this.excelService.getExcelDeltaLadder(
      args.session_id,
      args.book_id,
      args.trader_id,
      false,
    );
  }

  @Query('getExcelDeltaLadderData')
  @CheckPolicies(downloadOrdersPolicy)
  async getExcelDeltaLadderData(@Args() args: any): Promise<string> {
    return this.excelService.getExcelDeltaLadder(
      args.session_id,
      args.book_id,
      args.trader_id,
      true,
      args.order_id,
    );
  }

  @Query('getExcelSingleMaturityTemplate')
  @CheckPolicies(downloadLimitsPolicy)
  async getExcelSingleMaturityTemplate(@Args() args: any): Promise<string> {
    return this.excelService.getExcelSingleMaturity(
      args.session_id,
      args.book_id,
      args.trader_id,
      false,
    );
  }

  @Query('getExcelSingleMaturityData')
  @CheckPolicies(downloadLimitsPolicy)
  async getExcelSingleMaturityData(@Args() args: any): Promise<string> {
    return this.excelService.getExcelSingleMaturity(
      args.session_id,
      args.book_id,
      args.trader_id,
      true,
    );
  }

  @Query('getExcelDateRangeTemplate')
  @CheckPolicies(downloadLimitsPolicy)
  async getExcelDateRangeTemplate(@Args() args: any): Promise<string> {
    return this.excelService.getExcelDateRange(
      args.session_id,
      args.book_id,
      args.trader_id,
      false,
    );
  }

  @Query('getExcelDateRangeData')
  @CheckPolicies(downloadLimitsPolicy)
  async getExcelDateRangeData(@Args() args: any): Promise<string> {
    return this.excelService.getExcelDateRange(
      args.session_id,
      args.book_id,
      args.trader_id,
      true,
    );
  }

  @Query('getExcelMarketMakingTemplate')
  @CheckPolicies(downloadLimitsPolicy)
  async getExcelMarketMakingTemplate(@Args() args: any): Promise<string> {
    return this.excelService.getExcelMarketMaking(
      args.session_id,
      args.book_id,
      args.trader_id,
      false,
    );
  }

  @Query('getExcelMarketMakingData')
  @CheckPolicies(downloadLimitsPolicy)
  async getExcelMarketMakingData(@Args() args: any): Promise<string> {
    return this.excelService.getExcelMarketMaking(
      args.session_id,
      args.book_id,
      args.trader_id,
      true,
    );
  }

  @Mutation('replaceExcelCurveData')
  @CheckPolicies(uploadCurvesPolicy)
  async replaceExcelCurveData(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.excelService.replaceExcelCurveData(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.excel_data,
      user.user_id,
    );
  }

  @Mutation('replaceExcelDeltaLadderData')
  @CheckPolicies(uploadOrdersPolicy)
  async replaceExcelDeltaLadderData(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.excelService.replaceExcelDeltaLadderData(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.excel_data,
      user.user_id,
    );
  }

  @Mutation('replaceExcelSingleMaturityData')
  @CheckPolicies(uploadLimitsPolicy)
  async replaceExcelSingleMaturityData(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.excelService.replaceExcelSingleMaturityData(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.excel_data,
      user.user_id,
    );
  }

  @Mutation('replaceExcelDateRangeData')
  @CheckPolicies(uploadLimitsPolicy)
  async replaceExcelDateRangeData(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.excelService.replaceExcelDateRangeData(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.excel_data,
      user.user_id,
    );
  }

  @Mutation('replaceExcelMarketMakingData')
  @CheckPolicies(uploadOrdersPolicy)
  async replaceExcelMarketMakingData(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.excelService.replaceExcelMarketMakingData(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.excel_data,
      user.user_id,
    );
  }
}
