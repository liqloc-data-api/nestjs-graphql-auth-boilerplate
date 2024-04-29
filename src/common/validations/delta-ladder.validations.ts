import { z } from 'zod';
import { VALIDATION_CONFIG } from './config';
import { AmountType, PriceType } from 'frontend/graphql.schema';
import { roundingToDecimal } from './common.validations';
import { isEmpty } from 'utils/helper.functions';

export const DLOrderDetailMembersSchema = z
  .object({
    amount: z
      .number()
      .min(VALIDATION_CONFIG.DELTA_LADDER_DETAILS.AMOUNT.min)
      .max(VALIDATION_CONFIG.DELTA_LADDER_DETAILS.AMOUNT.max),
    price: z
      .number()
      .min(VALIDATION_CONFIG.DELTA_LADDER_DETAILS.PRICE.min)
      .max(VALIDATION_CONFIG.DELTA_LADDER_DETAILS.PRICE.max),
    preserve_amount: z.number().min(0).optional(),
    price_type: z.nativeEnum(PriceType),
    amount_type: z.nativeEnum(AmountType),
  })
  .passthrough()
  .refine(
    (data) => {
      if (
        !(
          data.preserve_amount === undefined || data.preserve_amount === null
        ) &&
        data.amount < data.preserve_amount
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Preserve amount should be less than or equal to amount',
      path: ['preserve_amount'],
    },
  )
  .transform((data) => ({
    ...data,
    price: roundingToDecimal(
      data.price,
      VALIDATION_CONFIG.DELTA_LADDER_DETAILS.PRICE.decimal,
    ),
    amount: roundingToDecimal(
      data.amount,
      VALIDATION_CONFIG.DELTA_LADDER_DETAILS.AMOUNT.decimal,
    ),
    ...(!isEmpty(data.preserve_amount) && {
      preserve_amount: roundingToDecimal(
        data.preserve_amount,
        VALIDATION_CONFIG.DELTA_LADDER_DETAILS.AMOUNT.decimal,
      ),
    }),
  }));
