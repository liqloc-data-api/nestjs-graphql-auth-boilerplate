import { z } from 'zod';
import { VALIDATION_CONFIG } from './config';
import { AmountType, PriceType } from 'frontend/graphql.schema';
import { roundingToDecimal } from './common.validations';
import { isEmpty } from 'utils/helper.functions';

function GenericMMOrderMembersSchema(orderType: string) {
  return z
    .object({
      pay_amount: z
        .number()
        .min(VALIDATION_CONFIG[orderType].AMOUNT.min)
        .max(VALIDATION_CONFIG[orderType].AMOUNT.max),
      receive_amount: z
        .number()
        .min(VALIDATION_CONFIG[orderType].AMOUNT.min)
        .max(VALIDATION_CONFIG[orderType].AMOUNT.max),
      pay_price: z
        .number()
        .min(VALIDATION_CONFIG[orderType].PAY_PRICE.min)
        .max(VALIDATION_CONFIG[orderType].PAY_PRICE.max),
      receive_price: z
        .number()
        .min(VALIDATION_CONFIG[orderType].RECEIVE_PRICE.min)
        .max(VALIDATION_CONFIG[orderType].RECEIVE_PRICE.max),
      fo_pay_amount: z
        .number()
        .min(VALIDATION_CONFIG[orderType].FO_AMOUNT.min)
        .max(VALIDATION_CONFIG[orderType].FO_AMOUNT.max)
        .optional(),
      fo_receive_amount: z
        .number()
        .min(VALIDATION_CONFIG[orderType].FO_AMOUNT.min)
        .max(VALIDATION_CONFIG[orderType].FO_AMOUNT.max)
        .optional(),
      fo_pay_price: z
        .number()
        .min(VALIDATION_CONFIG[orderType].FO_PAY_PRICE.min)
        .max(VALIDATION_CONFIG[orderType].FO_PAY_PRICE.max)
        .optional(),
      fo_receive_price: z
        .number()
        .min(VALIDATION_CONFIG[orderType].FO_RECEIVE_PRICE.min)
        .max(VALIDATION_CONFIG[orderType].FO_RECEIVE_PRICE.max)
        .optional(),
      price_type: z.nativeEnum(PriceType),
      amount_type: z.nativeEnum(AmountType),
    })
    .passthrough()
    .refine(
      (data) => {
        if (
          isEmpty(data.fo_pay_price) !== isEmpty(data.fo_pay_amount) ||
          isEmpty(data.fo_receive_price) !== isEmpty(data.fo_receive_amount)
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Follow-on amount and price both should be present.',
        path: ['fo_pay_amount', 'fo_receive_amount'],
      },
    )
    .transform((data) => ({
      ...data,
      pay_price: roundingToDecimal(
        data.pay_price,
        VALIDATION_CONFIG[orderType].PAY_PRICE.decimal,
      ),
      receive_price: roundingToDecimal(
        data.receive_price,
        VALIDATION_CONFIG[orderType].RECEIVE_PRICE.decimal,
      ),
      pay_amount: roundingToDecimal(
        data.pay_amount,
        VALIDATION_CONFIG[orderType].AMOUNT.decimal,
      ),
      receive_amount: roundingToDecimal(
        data.receive_amount,
        VALIDATION_CONFIG[orderType].AMOUNT.decimal,
      ),
      ...(!isEmpty(data.fo_pay_price) && {
        fo_pay_price: roundingToDecimal(
          data.fo_pay_price,
          VALIDATION_CONFIG[orderType].FO_PAY_PRICE.decimal,
        ),
      }),
      ...(!isEmpty(data.fo_receive_price) && {
        fo_receive_price: roundingToDecimal(
          data.fo_receive_price,
          VALIDATION_CONFIG[orderType].FO_RECEIVE_PRICE.decimal,
        ),
      }),
      ...(!isEmpty(data.fo_pay_amount) && {
        fo_pay_amount: roundingToDecimal(
          data.fo_pay_amount,
          VALIDATION_CONFIG[orderType].FO_AMOUNT.decimal,
        ),
      }),
      ...(!isEmpty(data.fo_receive_amount) && {
        fo_receive_amount: roundingToDecimal(
          data.fo_receive_amount,
          VALIDATION_CONFIG[orderType].FO_AMOUNT.decimal,
        ),
      }),
    }));
}

export const SingleMaturityMMOrderMembersSchema =
  GenericMMOrderMembersSchema('MARKET_MAKING_SM');

export const SpreadMMOrderMembersSchema =
  GenericMMOrderMembersSchema('MARKET_MAKING_SP');

export const FlyMMOrderMembersSchema =
  GenericMMOrderMembersSchema('MARKET_MAKING_FLY');
