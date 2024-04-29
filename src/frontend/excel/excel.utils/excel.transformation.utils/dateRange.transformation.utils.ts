import { SessionInstrument, SessionLimit } from 'frontend/graphql.schema';
import { KConversion } from './conversion.utils';
import { AmountType, MultiSessionDateRangeLimit } from 'graphql.schema';
import { ParameterSubTypeIdE } from 'frontend/parameters/enums_constants';

export interface DateRangeTemplateDataI {
  maturity_start: string;
  maturity_end: string;
  max_pay_limit: number;
  max_receive_limit: number;
}

export function toDateRangeDataTemplate(
  instruments: SessionInstrument[],
  data: SessionLimit[],
): DateRangeTemplateDataI[] {
  const idToInstrumentMap = new Map<number, SessionInstrument>(
    instruments.map((instrument) => [instrument.instrument_id, instrument]),
  );
  return data.map((dateRange) => {
    const data: DateRangeTemplateDataI = {
      maturity_start: idToInstrumentMap.get(
        dateRange.parameter_members.instrument_id_min,
      ).symbol,
      maturity_end: idToInstrumentMap.get(
        dateRange.parameter_members.instrument_id_max,
      ).symbol,
      max_pay_limit: KConversion.to(dateRange.parameter_members.max_pay_limit),
      max_receive_limit: KConversion.to(
        dateRange.parameter_members.max_receive_limit,
      ),
    };
    return data;
  });
}

export function toDBDateRangeFormat(
  sessionId: number,
  bookId: number,
  traderId: number,
  excelDateRange: DateRangeTemplateDataI[],
  instrumentMap: Map<string, SessionInstrument>,
  userId: number,
): MultiSessionDateRangeLimit[] {
  return excelDateRange
    .filter((dateRange) => dateRange.maturity_start && dateRange.maturity_end)
    .map((dataPoint) => {
      return {
        parameter_subtype_id: ParameterSubTypeIdE.DR,
        session_id: sessionId,
        book_id: bookId,
        trader_id: traderId,
        parameter_key: `${dataPoint.maturity_start}-${dataPoint.maturity_end}`,
        parameter_members: {
          instrument_id_min: instrumentMap.get(dataPoint.maturity_start)
            .instrument_id,
          instrument_id_max: instrumentMap.get(dataPoint.maturity_end)
            .instrument_id,
          max_pay_limit: KConversion.from(dataPoint.max_pay_limit),
          max_receive_limit: KConversion.from(dataPoint.max_receive_limit),
          unit: AmountType.DV01,
        },
        custom_members: null,
        updated_by: userId,
      };
    });
}
