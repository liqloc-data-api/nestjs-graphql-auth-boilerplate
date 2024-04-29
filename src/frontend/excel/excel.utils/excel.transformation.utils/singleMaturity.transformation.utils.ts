import {
  LiquidInstrumentsMembers,
  MultiSessionSingleMaturityLimit,
  SessionInstrument,
  SessionLimit,
} from 'frontend/graphql.schema';
import { ParameterSubTypeIdE } from 'frontend/parameters/enums_constants';
import { Session } from 'inspector';
import { LIQUID_MATURITY_SYMBOL } from '../enums_constants';
import { KConversion } from './conversion.utils';
import { AmountType } from 'graphql.schema';
import { isEmpty } from 'utils/helper.functions';

export interface SingleMaturityBlankTemplateDataI {
  maturity: string;
}

export interface SingleMaturityTemplateDataI {
  maturity: string;
  max_pay_limit: number;
  max_receive_limit: number;
  liquid_maturity_flag: string;
}

export function toSingleMaturityBlankTemplate(
  instruments: SessionInstrument[],
): SingleMaturityBlankTemplateDataI[] {
  return instruments.map((instrument) => {
    const data: SingleMaturityBlankTemplateDataI = {
      maturity: instrument.symbol,
    };
    return data;
  });
}

export function toSingleMaturityDataTemplate(
  instruments: SessionInstrument[],
  data: SessionLimit[],
  liquidMaturities: LiquidInstrumentsMembers,
): SingleMaturityTemplateDataI[] {
  const liquidInstruments = liquidMaturities?.instrument_ids || [];
  const symbolToDataMap = new Map<number, SessionLimit>(
    data.map((limit) => {
      if ((limit.parameter_subtype_id = ParameterSubTypeIdE.SM)) {
        return [limit.parameter_members.instrument_id, limit];
      }
    }),
  );
  return instruments.map((instrument) => {
    const limit = symbolToDataMap.get(instrument.instrument_id);
    const data: SingleMaturityTemplateDataI = {
      maturity: instrument.symbol,
      ...(limit && {
        max_pay_limit: KConversion.to(limit.parameter_members.max_pay_limit),
        max_receive_limit: KConversion.to(
          limit.parameter_members.max_receive_limit,
        ),
      }),
      ...(liquidInstruments.includes(instrument.instrument_id) && {
        liquid_maturity_flag: LIQUID_MATURITY_SYMBOL,
      }),
    };
    return data;
  });
}

export function toDBSingleMaturityFormat(
  sessionId: number,
  bookId: number,
  traderId: number,
  excelSingleMaturity: SingleMaturityTemplateDataI[],
  instrumentMap: Map<string, SessionInstrument>,
  userId: number,
): MultiSessionSingleMaturityLimit[] {
  return excelSingleMaturity
    .filter(
      (singleMaturity) =>
        !(
          isEmpty(singleMaturity.max_pay_limit) &&
          isEmpty(singleMaturity.max_receive_limit)
        ),
    )
    .map((dataPoint) => {
      return {
        parameter_subtype_id: ParameterSubTypeIdE.SM,
        session_id: sessionId,
        book_id: bookId,
        trader_id: traderId,
        parameter_key: dataPoint.maturity,
        parameter_members: {
          instrument_id: instrumentMap.get(dataPoint.maturity).instrument_id,
          max_pay_limit: KConversion.from(dataPoint.max_pay_limit),
          max_receive_limit: KConversion.from(dataPoint.max_receive_limit),
          unit: AmountType.DV01,
        },
        custom_members: null,
        updated_by: userId,
      };
    });
}
