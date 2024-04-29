import * as z from 'zod';
import { VALIDATION_CONFIG } from './config';
import { RateUnit } from 'frontend/graphql.schema';
import { roundingToDecimal } from './common.validations';
import { isEmpty } from 'utils/helper.functions';

export const CurveMembersSchema = z
  .object({
    dv01: z
      .number()
      .min(VALIDATION_CONFIG.CURVE.DV01.min)
      .max(VALIDATION_CONFIG.CURVE.DV01.max),
    pv01: z
      .number()
      .min(VALIDATION_CONFIG.CURVE.PV01.min)
      .max(VALIDATION_CONFIG.CURVE.PV01.max),
    rate_adj: z
      .number()
      .min(VALIDATION_CONFIG.CURVE.RATE_ADJUSTMENT.min)
      .max(VALIDATION_CONFIG.CURVE.RATE_ADJUSTMENT.max)
      .optional(),
    mid_market_rate: z
      .number()
      .min(VALIDATION_CONFIG.CURVE.MID_MARKET_RATE.min)
      .max(VALIDATION_CONFIG.CURVE.MID_MARKET_RATE.max),
    mid_market_rate_unit: z.nativeEnum(RateUnit),
    rate_adj_unit: z.nativeEnum(RateUnit),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    ...(!isEmpty(data.rate_adj) && {
      rate_adj: roundingToDecimal(
        data.rate_adj,
        VALIDATION_CONFIG.CURVE.RATE_ADJUSTMENT.decimal,
      ),
    }),
    mid_market_rate: roundingToDecimal(
      data.mid_market_rate,
      VALIDATION_CONFIG.CURVE.MID_MARKET_RATE.decimal,
    ),
    dv01: roundingToDecimal(data.dv01, VALIDATION_CONFIG.CURVE.DV01.decimal),
    pv01: roundingToDecimal(data.pv01, VALIDATION_CONFIG.CURVE.PV01.decimal),
  }));
