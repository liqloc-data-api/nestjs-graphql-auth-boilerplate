import {
  AmountType,
  PriceType,
  SessionInstrument,
  SessionMultiOrder,
  SessionOrder,
} from 'frontend/graphql.schema';
import { SubOrderTypeIdE } from 'frontend/orders/enums_constants';
import { Session } from 'inspector';
import { KConversion } from './conversion.utils';
import { isEmpty } from 'utils/helper.functions';

export enum MarketMakingTypeE {
  SM = 'Single Maturity',
  SP = 'Spread',
  FL = 'Fly',
}

export interface MarketMakingBlankTemplateDataI {
  type: string;
  maturity1: string;
}

export interface MarketMakingTemplateDataI {
  type: string;
  maturity1: string;
  maturity2?: string;
  maturity3?: string;
  pay_amount: number;
  pay_price: number;
  receive_amount: number;
  receive_price: number;
  fo_pay_amount?: number;
  fo_pay_add_price?: number;
  fo_receive_amount?: number;
  fo_receive_add_price?: number;
}

export function toSingleMaturityBlankTemplate(
  instruments: SessionInstrument[],
): MarketMakingBlankTemplateDataI[] {
  return instruments.map((instrument) => {
    const data: MarketMakingBlankTemplateDataI = {
      type: MarketMakingTypeE.SM,
      maturity1: instrument.symbol,
    };
    return data;
  });
}

export function toMarketMakingDataTemplate(
  instruments: SessionInstrument[],
  data: SessionOrder[],
): MarketMakingTemplateDataI[] {
  let outputData;
  const idToInstrumentMap = new Map<number, SessionInstrument>(
    instruments.map((instrument) => [instrument.instrument_id, instrument]),
  );
  const idTomMSMOrderMap = new Map<number, SessionOrder>(
    data
      .filter((order) => order.order_subtype_id === SubOrderTypeIdE.MM_SINGLE)
      .map((order) => [order.order_members.instrument_id1, order]),
  );
  outputData = instruments.map((instrument) => {
    const order = idTomMSMOrderMap.get(instrument.instrument_id);
    const data: MarketMakingTemplateDataI = {
      type: MarketMakingTypeE.SM,
      maturity1: instrument.symbol,
      ...(order && {
        pay_amount: KConversion.to(order.order_members.pay_amount),
        pay_price: order.order_members.pay_price,
        receive_amount: KConversion.to(order.order_members.receive_amount),
        receive_price: order.order_members.receive_price,
        ...(order.order_members.fo_pay_amount && {
          fo_pay_amount: KConversion.to(order.order_members.fo_pay_amount),
        }),
        ...(order.order_members.fo_pay_amount && {
          fo_pay_add_price: order.order_members.fo_pay_price
            ? order.order_members.fo_pay_price - order.order_members.pay_price
            : null,
        }),
        ...(order.order_members.fo_receive_amount && {
          fo_receive_amount: KConversion.to(
            order.order_members.fo_receive_amount,
          ),
        }),
        ...(order.order_members.fo_receive_amount && {
          fo_receive_add_price: order.order_members.fo_receive_price
            ? order.order_members.fo_receive_price -
              order.order_members.receive_price
            : null,
        }),
      }),
    };
    return data;
  });
  const additionalData = data
    .filter((order) => order.order_subtype_id !== SubOrderTypeIdE.MM_SINGLE)
    .map((order) => {
      let typeName;
      switch (order.order_subtype_id) {
        case SubOrderTypeIdE.MM_SPREAD:
          typeName = MarketMakingTypeE.SP;
          break;
        case SubOrderTypeIdE.MM_FLY:
          typeName = MarketMakingTypeE.FL;
          break;
        default:
          throw new Error('Invalid Market Making Type');
      }
      return {
        type: typeName,
        maturity1: idToInstrumentMap.get(order.order_members.instrument_id1)
          .symbol,
        maturity2: idToInstrumentMap.get(order.order_members.instrument_id2)
          .symbol,
        maturity3: order.order_members.instrument_id3
          ? idToInstrumentMap.get(order.order_members.instrument_id3).symbol
          : null,
        pay_amount: KConversion.to(order.order_members.pay_amount),
        pay_price: order.order_members.pay_price,
        receive_amount: KConversion.to(order.order_members.receive_amount),
        receive_price: order.order_members.receive_price,
        fo_pay_amount:
          order.order_members.fo_pay_amount &&
          KConversion.to(order.order_members.fo_pay_amount),
        fo_pay_add_price: order.order_members.fo_pay_price
          ? order.order_members.fo_pay_price - order.order_members.pay_price
          : null,
        fo_receive_amount:
          order.order_members.fo_receive_amount &&
          KConversion.to(order.order_members.fo_receive_amount),
        fo_receive_add_price: order.order_members.fo_receive_price
          ? order.order_members.fo_receive_price -
            order.order_members.receive_price
          : null,
      };
    });
  return outputData.concat(additionalData);
}

export function toDBmarketMakingFormat(
  sessionId: number,
  bookId: number,
  traderId: number,
  excelMarketMaking: MarketMakingTemplateDataI[],
  instrumentMap: Map<string, SessionInstrument>,
  userId: number,
): SessionMultiOrder[] {
  return excelMarketMaking
    .filter(
      (marketMaking) =>
        marketMaking.pay_amount !== null &&
        marketMaking.receive_amount !== null,
    )
    .map((dataPoint) => {
      let orderSubtypeId;
      switch (dataPoint.type) {
        case MarketMakingTypeE.SM:
          orderSubtypeId = SubOrderTypeIdE.MM_SINGLE;
          break;
        case MarketMakingTypeE.SP:
          orderSubtypeId = SubOrderTypeIdE.MM_SPREAD;
          break;
        case MarketMakingTypeE.FL:
          orderSubtypeId = SubOrderTypeIdE.MM_FLY;
          break;
        default:
          throw new Error('Invalid Market Making Type');
      }
      return {
        session_id: sessionId,
        book_id: bookId,
        trader_id: traderId,
        order_subtype_id: orderSubtypeId,
        order_key: null,
        order_members: {
          instrument_id1: instrumentMap.get(dataPoint.maturity1).instrument_id,
          ...(['SubOrderTypeIdE.MM_SPREAD, SubOrderTypeIdE.MM_FLY'].includes(
            orderSubtypeId,
          ) && {
            instrument_id2: instrumentMap.get(dataPoint.maturity2)
              .instrument_id,
          }),
          ...(orderSubtypeId === SubOrderTypeIdE.MM_FLY && {
            instrument_id3: instrumentMap.get(dataPoint.maturity3)
              .instrument_id,
          }),
          pay_amount: KConversion.from(dataPoint.pay_amount),
          pay_price: dataPoint.pay_price,
          receive_amount: KConversion.from(dataPoint.receive_amount),
          receive_price: dataPoint.receive_price,
          ...(!isEmpty(dataPoint.fo_pay_amount) && {
            fo_pay_amount: KConversion.from(dataPoint.fo_pay_amount),
          }),
          ...(!isEmpty(dataPoint.fo_pay_add_price) && {
            fo_pay_price: dataPoint.fo_pay_add_price
              ? dataPoint.fo_pay_add_price + dataPoint.pay_price
              : null,
          }),
          ...(!isEmpty(dataPoint.fo_receive_amount) && {
            fo_receive_amount: KConversion.from(dataPoint.fo_receive_amount),
          }),
          ...(!isEmpty(dataPoint.fo_receive_add_price) && {
            fo_receive_price: dataPoint.fo_receive_add_price
              ? dataPoint.fo_receive_add_price + dataPoint.receive_price
              : null,
          }),
          price_type: PriceType.SPREAD_TO_MID,
          amount_type: AmountType.DV01,
        },
        custom_members: null,
        updated_by: userId,
      };
    });
}
