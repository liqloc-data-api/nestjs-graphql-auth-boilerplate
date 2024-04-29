import {
  LiquidInstrumentsMembers,
  MultiSessionCurveInput,
  RateUnit,
  SessionCurve,
  SessionInstrument,
} from 'frontend/graphql.schema';
import { LIQUID_MATURITY_SYMBOL } from '../enums_constants';
import { isEmpty } from 'utils/helper.functions';

export interface CurveTemplateDataI {
  maturity: string;
  maturity_date: string;
  mid_market_rate: number;
  rate_adj: number;
  dv01: number;
  pv01: number;
  liquid_maturity_flag: string;
}

export interface CurveBlankTemplateDataI {
  maturity: string;
}

export function toCurveBlankTemplate(
  instruments: SessionInstrument[],
): CurveBlankTemplateDataI[] {
  return instruments.map((instrument) => {
    const data: CurveBlankTemplateDataI = {
      maturity: instrument.symbol,
    };
    return data;
  });
}

export function toCurveTemplate(
  instruments: SessionInstrument[],
  data: SessionCurve[],
  liquidMaturities: LiquidInstrumentsMembers,
): CurveTemplateDataI[] {
  const liquidInstruments = liquidMaturities?.instrument_ids || [];
  const symbolToDataMap = new Map<string, SessionCurve>(
    data.map((curve) => [curve.symbol, curve]),
  );
  return instruments.map((instrument) => {
    const curve = symbolToDataMap.get(instrument.symbol);
    const data: CurveTemplateDataI = {
      maturity: instrument.symbol,
      maturity_date: instrument.instrument_members.maturityDate,
      ...(curve && {
        mid_market_rate: curve.curve_members.mid_market_rate,
        rate_adj: curve.curve_members.rate_adj,
        dv01: curve.curve_members.dv01,
        pv01: curve.curve_members.pv01,
      }),
      ...(liquidInstruments.includes(instrument.instrument_id) && {
        liquid_maturity_flag: LIQUID_MATURITY_SYMBOL,
      }),
    };
    return data;
  });
}

export function toDbCurveFormat(
  sessionId: number,
  bookId: number,
  traderId: number,
  userId: number,
  excelCurve: CurveTemplateDataI[],
  instrumentMap: Map<string, SessionInstrument>,
): MultiSessionCurveInput[] {
  return excelCurve
    .filter(
      (curve) =>
        !(
          isEmpty(curve.mid_market_rate) &&
          isEmpty(curve.dv01) &&
          isEmpty(curve.pv01)
        ),
    )
    .map((curve) => {
      return {
        session_id: sessionId,
        book_id: bookId,
        trader_id: traderId,
        instrument_id: instrumentMap.get(curve.maturity).instrument_id,
        curve_members: {
          mid_market_rate: curve.mid_market_rate,
          ...(curve.rate_adj && { rate_adj: curve.rate_adj }),
          dv01: curve.dv01,
          pv01: curve.pv01,
          rate_adj_unit: RateUnit.BASIS_POINT,
          mid_market_rate_unit: RateUnit.PERCENTAGE,
        },
        custom_members: null,
        updated_by: userId,
      };
    });
}
