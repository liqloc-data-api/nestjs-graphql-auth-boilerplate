import {
  LiquidInstrumentsMembers,
  SessionInstrument,
} from 'frontend/graphql.schema';
import { CurveTemplateDataI } from './curve.transformation.utils';
import { LIQUID_MATURITY_SYMBOL } from '../enums_constants';
import { DeltaLadderTemplateDataI } from './deltaLadder.transformation.utils';
import { SingleMaturityTemplateDataI } from './singleMaturity.transformation.utils';

export function toDBLiquidMaturitiesFormat(
  instrumentMap: Map<string, SessionInstrument>,
  data: any[],
  // | CurveTemplateDataI[]
  // | DeltaLadderTemplateDataI[]
  // | SingleMaturityTemplateDataI[],
): LiquidInstrumentsMembers {
  const liquidInstruments = data
    .filter(
      (dataPoint) => dataPoint?.liquid_maturity_flag === LIQUID_MATURITY_SYMBOL,
    )
    .map((dataPoint) => instrumentMap.get(dataPoint?.maturity).instrument_id);
  const liquidMaturities: LiquidInstrumentsMembers = {
    instrument_ids: liquidInstruments,
  };
  return liquidMaturities;
}
