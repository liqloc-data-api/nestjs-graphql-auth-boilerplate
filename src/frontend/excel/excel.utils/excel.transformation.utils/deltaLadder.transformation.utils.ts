import {
  AmountType,
  Direction,
  LiquidInstrumentsMembers,
  MultiSessionOrderDetail,
  SessionInstrument,
  SessionOrderDetail,
} from 'frontend/graphql.schema';
import { LIQUID_MATURITY_SYMBOL } from '../enums_constants';
import { KConversion } from './conversion.utils';
import { PriceType } from 'graphql.schema';
import { isEmpty } from 'utils/helper.functions';

export interface DeltaLadderBlankTemplateDataI {
  maturity: string;
}

export interface DeltaLadderTemplateDataI {
  maturity: string;
  direction: string;
  amount: number;
  preserve_amount: number;
  price: number;
  liquid_maturity_flag: string;
}

export function toDeltaLadderBlankTemplate(
  instruments: SessionInstrument[],
): DeltaLadderBlankTemplateDataI[] {
  return instruments.map((instrument) => {
    const data: DeltaLadderBlankTemplateDataI = {
      maturity: instrument.symbol,
    };
    return data;
  });
}

export function toDeltaLadderDataTemplate(
  instruments: SessionInstrument[],
  data: SessionOrderDetail[],
  liquidMaturities: LiquidInstrumentsMembers,
): DeltaLadderTemplateDataI[] {
  const liquidInstruments = liquidMaturities?.instrument_ids || [];
  const symbolToDataMap = new Map<number, SessionOrderDetail>(
    data.map((deltaLadder) => [deltaLadder.instrument_id, deltaLadder]),
  );
  return instruments.map((instrument) => {
    const deltaLadder = symbolToDataMap.get(instrument.instrument_id);
    const data: DeltaLadderTemplateDataI = {
      maturity: instrument.symbol,
      ...(deltaLadder && {
        direction: deltaLadder.order_detail_members.direction,
        amount: KConversion.to(deltaLadder.order_detail_members.amount),
        ...(deltaLadder.order_detail_members.preserve_amount && {
          preserve_amount: KConversion.to(
            deltaLadder.order_detail_members.preserve_amount,
          ),
        }),
        price: deltaLadder.order_detail_members.price || 0,
      }),
      ...(liquidInstruments.includes(instrument.instrument_id) && {
        liquid_maturity_flag: LIQUID_MATURITY_SYMBOL,
      }),
    };
    return data;
  });
}

export function toDbDeltaLadderFormat(
  sessionId: number,
  orderId: number,
  excelDeltaLadder: DeltaLadderTemplateDataI[],
  instrumentMap: Map<string, SessionInstrument>,
  userId: number,
): MultiSessionOrderDetail[] {
  return excelDeltaLadder
    .filter(
      (deltaLadder) =>
        !(isEmpty(deltaLadder.amount) && isEmpty(deltaLadder.price)),
    )
    .map((deltaLadder) => {
      const instrument = instrumentMap.get(deltaLadder.maturity);
      return {
        order_id: orderId,
        session_id: sessionId,
        instrument_id: instrument.instrument_id,
        order_detail_members: {
          amount: KConversion.from(deltaLadder.amount),
          direction: deltaLadder.direction as Direction,
          price: deltaLadder.price,
          ...(deltaLadder.preserve_amount && {
            preserve_amount: KConversion.from(deltaLadder.preserve_amount),
          }),
          price_type: PriceType.PREMIUM_TO_MID,
          amount_type: AmountType.DV01,
        },
        custom_members: null,
        updated_by: userId,
      };
    });
}
