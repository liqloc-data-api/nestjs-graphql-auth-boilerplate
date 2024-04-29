import { z } from 'zod';
import { VALIDATION_CONFIG } from './config';
import { AmountType, Direction, PriceType } from 'frontend/graphql.schema';
import { roundingToDecimal } from './common.validations';
import { isEmpty } from 'utils/helper.functions';

function GenericDOrderMembersSchema(orderType: string) {
  return z
    .object({
      amount: z
        .number()
        .min(VALIDATION_CONFIG[orderType].AMOUNT.min)
        .max(VALIDATION_CONFIG[orderType].AMOUNT.max),
      price: z
        .number()
        .min(VALIDATION_CONFIG[orderType].PRICE.min)
        .max(VALIDATION_CONFIG[orderType].PRICE.max),
      fo_amount: z
        .number()
        .min(VALIDATION_CONFIG[orderType].FO_AMOUNT.min)
        .max(VALIDATION_CONFIG[orderType].FO_AMOUNT.max)
        .optional(),
      fo_price: z
        .number()
        .min(VALIDATION_CONFIG[orderType].FO_PRICE.min)
        .max(VALIDATION_CONFIG[orderType].FO_PRICE.max)
        .optional(),
      liquidity_premium: z
        .number()
        .min(VALIDATION_CONFIG[orderType].LIQUIDITY_PREMIUM.min)
        .max(VALIDATION_CONFIG[orderType].LIQUIDITY_PREMIUM.max)
        .optional(),
      price_type: z.nativeEnum(PriceType),
      amount_type: z.nativeEnum(AmountType),
    })
    .passthrough()
    .refine(
      (data) => {
        if (isEmpty(data.fo_amount) !== isEmpty(data.fo_price)) {
          return false;
        }
        return true;
      },
      {
        message: 'Follow-on amount and price both should be present.',
        path: ['fo_amount', 'fo_price'],
      },
    )
    .transform((data) => ({
      ...data,
      price: roundingToDecimal(
        data.price,
        VALIDATION_CONFIG[orderType].PRICE.decimal,
      ),
      amount: roundingToDecimal(
        data.amount,
        VALIDATION_CONFIG[orderType].AMOUNT.decimal,
      ),
      ...(!isEmpty(data.fo_price) && {
        fo_price: roundingToDecimal(
          data.fo_price,
          VALIDATION_CONFIG[orderType].FO_PRICE.decimal,
        ),
      }),
      ...(!isEmpty(data.fo_amount) && {
        fo_amount: roundingToDecimal(
          data.fo_amount,
          VALIDATION_CONFIG[orderType].FO_AMOUNT.decimal,
        ),
      }),
      ...(!isEmpty(data.liquidity_premium) && {
        liquidity_premium: roundingToDecimal(
          data.liquidity_premium,
          VALIDATION_CONFIG[orderType].LIQUIDITY_PREMIUM.decimal,
        ),
      }),
    }));
}

export const SingleMaturityDOrderMembersSchema =
  GenericDOrderMembersSchema('DIRECTIONAL_SM');

export const SpreadDOrderMembersSchema =
  GenericDOrderMembersSchema('DIRECTIONAL_SP');

export const FlyDOrderMembersSchema =
  GenericDOrderMembersSchema('DIRECTIONAL_FLY');

const AllOfOrderDetailsSchema = z
  .object({
    amount: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.AMOUNT.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.AMOUNT.max),
    price: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.PRICE.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.PRICE.max),
    direction: z.nativeEnum(Direction),
    fo_amount: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_AMOUNT.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_AMOUNT.max)
      .optional(),
    fo_price: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_PRICE.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_PRICE.max)
      .optional(),
  })
  .passthrough()
  .refine(
    (data) => {
      if (!isEmpty(data.fo_amount) !== !isEmpty(data.fo_price)) {
        return false;
      }
      return true;
    },
    {
      message: 'Follow-on amount and price both should be present.',
      path: ['fo_amount', 'fo_price'],
    },
  )
  .transform((data) => ({
    ...data,
    price: roundingToDecimal(
      data.price,
      VALIDATION_CONFIG.DIRECTIONAL_SM.PRICE.decimal,
    ),
    amount: roundingToDecimal(
      data.amount,
      VALIDATION_CONFIG.DIRECTIONAL_SM.AMOUNT.decimal,
    ),
    ...(!isEmpty(data.fo_price) && {
      fo_price: roundingToDecimal(
        data.fo_price,
        VALIDATION_CONFIG.DIRECTIONAL_SM.FO_PRICE.decimal,
      ),
    }),
    ...(!isEmpty(data.fo_amount) && {
      fo_amount: roundingToDecimal(
        data.fo_amount,
        VALIDATION_CONFIG.DIRECTIONAL_SM.FO_AMOUNT.decimal,
      ),
    }),
  }));

export const AllOfDOrderMembersSchema = z
  .object({
    liquidity_premium: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.LIQUIDITY_PREMIUM.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.LIQUIDITY_PREMIUM.max)
      .optional(),
    order_details: z.array(AllOfOrderDetailsSchema),
    price_type: z.nativeEnum(PriceType),
    amount_type: z.nativeEnum(AmountType),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    ...(!isEmpty(data.liquidity_premium) && {
      liquidity_premium: roundingToDecimal(
        data.liquidity_premium,
        VALIDATION_CONFIG.DIRECTIONAL_SM.LIQUIDITY_PREMIUM.decimal,
      ),
    }),
  }));

const AnyOfDOrderDetailsSchema = z
  .object({
    price: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.PRICE.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.PRICE.max),
    direction: z.nativeEnum(Direction),
    fo_price: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_PRICE.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_PRICE.max)
      .optional(),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    price: roundingToDecimal(
      data.price,
      VALIDATION_CONFIG.DIRECTIONAL_SM.PRICE.decimal,
    ),
    ...(!isEmpty(data.fo_price) && {
      fo_price: roundingToDecimal(
        data.fo_price,
        VALIDATION_CONFIG.DIRECTIONAL_SM.FO_PRICE.decimal,
      ),
    }),
  }));

export const AnyOfDOrderMembersSchema = z
  .object({
    amount: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.AMOUNT.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.AMOUNT.max),
    fo_amount: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_AMOUNT.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.FO_AMOUNT.max)
      .optional(),
    direction: z.nativeEnum(Direction),
    liquidity_premium: z
      .number()
      .min(VALIDATION_CONFIG.DIRECTIONAL_SM.LIQUIDITY_PREMIUM.min)
      .max(VALIDATION_CONFIG.DIRECTIONAL_SM.LIQUIDITY_PREMIUM.max)
      .optional(),
    order_details: z.array(AnyOfDOrderDetailsSchema),
    price_type: z.nativeEnum(PriceType),
    amount_type: z.nativeEnum(AmountType),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    amount: roundingToDecimal(
      data.amount,
      VALIDATION_CONFIG.DIRECTIONAL_SM.AMOUNT.decimal,
    ),
    ...(!isEmpty(data.fo_amount) && {
      fo_amount: roundingToDecimal(
        data.fo_amount,
        VALIDATION_CONFIG.DIRECTIONAL_SM.FO_AMOUNT.decimal,
      ),
    }),
    ...(!isEmpty(data.liquidity_premium) && {
      liquidity_premium: roundingToDecimal(
        data.liquidity_premium,
        VALIDATION_CONFIG.DIRECTIONAL_SM.LIQUIDITY_PREMIUM.decimal,
      ),
    }),
  }));
