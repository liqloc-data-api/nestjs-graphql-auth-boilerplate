import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import {
  readOrdersPolicy,
  uploadOrdersPolicy,
  writeOrdersPolicy,
} from 'frontend/casl/casl.policies';
import {
  AddMutationResponse,
  DeleteMutationResponse,
  SessionOrder,
  SessionOrderDetail,
} from 'frontend/graphql.schema';
import { UserMeInfo } from 'common/decorators/currentUser.decorator';
import { UserMe } from 'graphql.schema';
import { SubOrderTypeIdE } from './enums_constants';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
@UseGuards(PoliciesGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query('getSessionOrdersByOrderTypes')
  @CheckPolicies(readOrdersPolicy)
  async getSessionOrdersByOrderTypes(
    @Args() args: any,
  ): Promise<SessionOrder[]> {
    return this.ordersService.getSessionOrdersByOrderTypes(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_type_ids,
    );
  }

  @Query('getSessionOrderById')
  @CheckPolicies(readOrdersPolicy)
  async getSessionOrdersById(@Args() args: any): Promise<SessionOrder> {
    return this.ordersService.getSessionOrderById(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
    );
  }

  @Query('getSessionOrderDetailsByOrderId')
  @CheckPolicies(readOrdersPolicy)
  async getSessionOrderDetailsByOrderId(
    @Args() args: any,
  ): Promise<SessionOrderDetail[]> {
    return this.ordersService.getSessionOrderDetailsByOrderId(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
    );
  }

  @Query('getSessionOrderDetailsByInstrumentId')
  @CheckPolicies(readOrdersPolicy)
  async getSessionOrderDetailsByInstrumentId(
    @Args() args: any,
  ): Promise<SessionOrderDetail> {
    return this.ordersService.getSessionOrderDetailsByInstrumentId(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.instrument_id,
    );
  }

  @Mutation('addSingleMaturityDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addSingleMaturityDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDOOrder(
      SubOrderTypeIdE.DO_SINGLE,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addSpreadDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addSpreadDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDOOrder(
      SubOrderTypeIdE.DO_SPREAD,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addFlyDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addFlyDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDOOrder(
      SubOrderTypeIdE.DO_FLY,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addAnyOfDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addAnyOfDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDOOrder(
      SubOrderTypeIdE.DO_ANY_OF,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addAllOfDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addAllOfDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDOOrder(
      SubOrderTypeIdE.DO_ALL_OF,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addTagAlongDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addTagAlongDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDOOrder(
      SubOrderTypeIdE.DO_TAG_ALONG,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateSingleMaturityDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateSingleMaturityDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DO_SINGLE;
    return this.ordersService.updateDOOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateSpreadDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateSpreadDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DO_SPREAD;
    return this.ordersService.updateDOOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateFlyDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateFlyDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DO_FLY;
    return this.ordersService.updateDOOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateAnyOfDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateAnyOfDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DO_ANY_OF;
    return this.ordersService.updateDOOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateAllOfDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateAllOfDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DO_ALL_OF;
    return this.ordersService.updateDOOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateTagAlongDOOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateTagAlongDOOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DO_TAG_ALONG;
    return this.ordersService.updateDOOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addSingleMaturityMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addSingleMaturityMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addMMOrder(
      SubOrderTypeIdE.MM_SINGLE,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addSpreadMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addSpreadMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addMMOrder(
      SubOrderTypeIdE.MM_SPREAD,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addFlyMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addFlyMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addMMOrder(
      SubOrderTypeIdE.MM_FLY,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateSingleMaturityMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateSingleMaturityMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.updateMMOrder(
      SubOrderTypeIdE.MM_SINGLE,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateSpreadMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateSpreadMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.updateMMOrder(
      SubOrderTypeIdE.MM_SPREAD,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateFlyMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateFlyMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.updateMMOrder(
      SubOrderTypeIdE.MM_FLY,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addRuleBasedMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addRuleBasedMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addRuleBasedMMOrder(
      args.order_subtype_id,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateRuleBasedMMOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateRuleBasedMMOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.updateRuleBasedMMOrder(
      args.order_subtype_id,
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.order_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('addDeltaLadderOrder')
  @CheckPolicies(writeOrdersPolicy)
  async addDeltaLadderOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDeltaLadderOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_members,
      user.user_id,
    );
  }

  @Mutation('addDeltaLadderOrderDetail')
  @CheckPolicies(writeOrdersPolicy)
  async addDeltaLadderOrderDetail(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.addDeltaLadderOrderDetail(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.instrument_id,
      args.order_detail_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateDeltaLadderOrderDetail')
  @CheckPolicies(writeOrdersPolicy)
  async updateDeltaLadderOrderDetail(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    return this.ordersService.updateDeltaLadderOrderDetail(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.instrument_id,
      args.order_detail_members,
      args.custom_members,
      user.user_id,
    );
  }

  @Mutation('updateDeltaLadderOrder')
  @CheckPolicies(writeOrdersPolicy)
  async updateDeltaLadderOrder(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<AddMutationResponse> {
    args.order_subtype_id = SubOrderTypeIdE.DL;
    return this.ordersService.updateDeltaLadderOrder(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_subtype_id,
      args.order_id,
      args.order_members,
      user.user_id,
    );
  }

  @Mutation('deleteSessionOrdersCustomColumn')
  @CheckPolicies(writeOrdersPolicy)
  async deleteSessionOrdersCustomColumn(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ordersService.deleteSessionOrdersCustomColumn(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_type_id,
      args.column_name,
      user.user_id,
    );
  }

  @Mutation('deleteSessionOrders')
  @CheckPolicies(writeOrdersPolicy)
  async deleteSessionOrders(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ordersService.deleteSessionOrders(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_ids,
      user.user_id,
    );
  }

  @Mutation('deleteAllSessionOrdersByTypeIds')
  @CheckPolicies(uploadOrdersPolicy)
  async deleteAllSessionOrdersByTypeIds(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ordersService.deleteAllSessionOrdersByTypeIds(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_type_ids,
      user.user_id,
    );
  }

  @Mutation('deleteOrderDetailsCustomColumn')
  @CheckPolicies(writeOrdersPolicy)
  async deleteOrderDetailsCustomColumn(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ordersService.deleteOrderDetailsCustomColumn(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.column_name,
      user.user_id,
    );
  }

  @Mutation('deleteOrderDetails')
  @CheckPolicies(writeOrdersPolicy)
  async deleteOrderDetails(
    @Args() args: any,
    @UserMeInfo('userMe') user: UserMe,
  ): Promise<DeleteMutationResponse> {
    return this.ordersService.deleteOrderDetails(
      args.session_id,
      args.book_id,
      args.trader_id,
      args.order_id,
      args.instrument_ids,
      user.user_id,
    );
  }
}
