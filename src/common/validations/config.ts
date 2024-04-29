export const VALIDATION_CONFIG = {
  CURVE: {
    DV01: {
      min: 0,
      max: 50,
      decimal: 5,
    },
    PV01: {
      min: 0,
      max: 50,
      decimal: 5,
    },
    RATE_ADJUSTMENT: {
      min: -10,
      max: 10,
      decimal: 6,
    },
    MID_MARKET_RATE: {
      min: 0,
      max: 15,
      decimal: 8,
    },
  },
  DELTA_LADDER_DETAILS: {
    AMOUNT: {
      min: 0,
      max: 1000000,
      decimal: 0,
    },
    PRICE: {
      min: 0,
      max: 5,
      decimal: 6,
    },
  },
  SINGLE_MATURITY_LIMITS: {
    MAX_PAY_LIMIT: {
      min: 0,
      max: 1500000,
      decimal: 0,
    },
    MAX_RECEIVE_LIMIT: {
      min: 0,
      max: 1500000,
      decimal: 0,
    },
  },
  DATE_RANGE_LIMITS: {
    MAX_PAY_LIMIT: {
      min: 0,
      max: 3000000,
      decimal: 0,
    },
    MAX_RECEIVE_LIMIT: {
      min: 0,
      max: 3000000,
      decimal: 0,
    },
  },
  MARKET_MAKING_SM: {
    AMOUNT: {
      min: 0,
      max: 1000000,
      decimal: 0,
    },
    PAY_PRICE: {
      min: -5,
      max: 0,
      decimal: 6,
    },
    RECEIVE_PRICE: {
      min: 0,
      max: 5,
      decimal: 6,
    },
    FO_AMOUNT: {
      min: 0,
      max: 1000000,
      decimal: 0,
    },
    FO_PAY_PRICE: {
      min: -10,
      max: 0,
      decimal: 6,
    },
    FO_RECEIVE_PRICE: {
      min: 0,
      max: 10,
      decimal: 6,
    },
  },
  MARKET_MAKING_SP: {
    AMOUNT: {
      min: 0,
      max: 2000000,
      decimal: 0,
    },
    PAY_PRICE: {
      min: -5,
      max: 0,
      decimal: 6,
    },
    RECEIVE_PRICE: {
      min: 0,
      max: 5,
      decimal: 6,
    },
    FO_AMOUNT: {
      min: 0,
      max: 1000000,
      decimal: 0,
    },
    FO_PAY_PRICE: {
      min: -10,
      max: 0,
      decimal: 6,
    },
    FO_RECEIVE_PRICE: {
      min: 0,
      max: 10,
      decimal: 6,
    },
  },
  MARKET_MAKING_FLY: {
    AMOUNT: {
      min: 0,
      max: 2000000,
      decimal: 0,
    },
    PAY_PRICE: {
      min: -5,
      max: 0,
      decimal: 6,
    },
    RECEIVE_PRICE: {
      min: 0,
      max: 5,
      decimal: 6,
    },
    FO_AMOUNT: {
      min: 0,
      max: 2000000,
      decimal: 0,
    },
    FO_PAY_PRICE: {
      min: -10,
      max: 0,
      decimal: 6,
    },
    FO_RECEIVE_PRICE: {
      min: 0,
      max: 10,
      decimal: 6,
    },
  },
  DIRECTIONAL_SM: {
    AMOUNT: {
      min: 0,
      max: 2000000,
      decimal: 0,
    },
    PRICE: {
      min: -5,
      max: 5,
      decimal: 6,
    },
    FO_AMOUNT: {
      min: 0,
      max: 2000000,
      decimal: 0,
    },
    FO_PRICE: {
      min: -10,
      max: 10,
      decimal: 6,
    },
    LIQUIDITY_PREMIUM: {
      min: 0,
      max: 1000000,
      decimal: 0,
    },
  },
  DIRECTIONAL_SP: {
    AMOUNT: {
      min: 0,
      max: 4000000,
      decimal: 0,
    },
    PRICE: {
      min: -5,
      max: 5,
      decimal: 6,
    },
    FO_AMOUNT: {
      min: 0,
      max: 4000000,
      decimal: 0,
    },
    FO_PRICE: {
      min: -10,
      max: 10,
      decimal: 6,
    },
    LIQUIDITY_PREMIUM: {
      min: 0,
      max: 4000000,
      decimal: 0,
    },
  },
  DIRECTIONAL_FLY: {
    AMOUNT: {
      min: 0,
      max: 4000000,
      decimal: 0,
    },
    PRICE: {
      min: -5,
      max: 5,
      decimal: 6,
    },
    FO_AMOUNT: {
      min: 0,
      max: 4000000,
      decimal: 0,
    },
    FO_PRICE: {
      min: -10,
      max: 10,
      decimal: 6,
    },
    LIQUIDITY_PREMIUM: {
      min: 0,
      max: 1000000,
      decimal: 0,
    },
  },
};
