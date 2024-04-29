import { z } from 'zod';
import { VALIDATION_CONFIG } from './config';
import { AmountType, PriceType } from 'frontend/graphql.schema';
import { roundingToDecimal } from './common.validations';

export const DateRangeLimitMembersSchema = z
  .object({
    max_pay_limit: z
      .number()
      .min(VALIDATION_CONFIG.DATE_RANGE_LIMITS.MAX_PAY_LIMIT.min)
      .max(VALIDATION_CONFIG.DATE_RANGE_LIMITS.MAX_PAY_LIMIT.max),
    max_receive_limit: z
      .number()
      .min(VALIDATION_CONFIG.DATE_RANGE_LIMITS.MAX_RECEIVE_LIMIT.min)
      .max(VALIDATION_CONFIG.DATE_RANGE_LIMITS.MAX_RECEIVE_LIMIT.max),
    unit: z.nativeEnum(AmountType),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    max_pay_limit: roundingToDecimal(
      data.max_pay_limit,
      VALIDATION_CONFIG.DATE_RANGE_LIMITS.MAX_PAY_LIMIT.decimal,
    ),
    max_receive_limit: roundingToDecimal(
      data.max_receive_limit,
      VALIDATION_CONFIG.DATE_RANGE_LIMITS.MAX_RECEIVE_LIMIT.decimal,
    ),
  }));
