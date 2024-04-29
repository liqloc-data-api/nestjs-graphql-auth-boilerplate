import { AppLogger } from 'common/logger/logger.service';
import {
  AutoQuote,
  CurveMembersInput,
  FollowOnQuote,
  MMWJson,
  QuoteRow,
  Session,
  SessionInstrument,
  DeltaLadderOrderDetailMembers,
  FlyDOMembers,
  LiquidInstrumentsMembers,
  RelativeDateLimitSettingMembers,
  RuleBasedMMOrderMembers,
  SingleMaturityDOMembers,
  SingleMaturityLimitSettingMembers,
  SingleMaturityMMOrderMembers,
  SpreadDOMembers,
  SessionMultiOrder,
} from 'frontend/graphql.schema';
import {
  dateFromYearInstrument,
  getSymbolToInstrumentMapper,
  innerRangeEndInstruments,
  innerRangeInstruments,
  outerRangeInstruments,
} from 'frontend/session-instruments/session-instruments.utils';
import { OrderTypeIdE, SubOrderTypeIdE } from 'frontend/orders/enums_constants';
import { NOTIONAL_MULTIPLIER } from '../enums_constants';
import { AmountType, PriceType } from 'graphql.schema';

const logger = new AppLogger();

interface MMWParserServiceI {
  data: any;
  error: any;
}

interface MMWParserOutputI {
  data: {
    liquidInstruments: LiquidInstrumentsMembers | undefined;
    singleMaturitySettings: SingleMaturityLimitSettingMembers | undefined;
    ruleBasedOrders: Record<number, RuleBasedMMOrderMembers> | undefined;
    relativeDateSettings: RelativeDateLimitSettingMembers | undefined;
    liquidMMOrders: SingleMaturityMMOrderMembers[] | undefined;
    spotMMOrders: SingleMaturityMMOrderMembers[] | undefined;
    immMMOrders: SingleMaturityMMOrderMembers[] | undefined;
  };
  error: {
    liquidInstruments: any[];
    singleMaturitySettings: any[];
    ruleBasedOrders: any[];
    relativeDateSettings: any[];
    liquidMMOrders: any[];
    spotMMOrders: any[];
    immMMOrders: any[];
  };
  code: number;
}

export class MMWParser {
  mmwParserOutput: MMWParserOutputI;
  sessionDate: Date;

  constructor(
    private readonly mmwJsonObj: MMWJson,
    private readonly sessionInstruments: SessionInstrument[],
    readonly sessionDetails: Session,
    private readonly defaultRelativeDateSettings: Record<
      number,
      RelativeDateLimitSettingMembers
    >,
  ) {
    logger.setContext('MMWParser');
    this.sessionDate = new Date(sessionDetails.session_date);
    this.mmwParserOutput = {
      data: {
        liquidInstruments: undefined,
        singleMaturitySettings: undefined,
        ruleBasedOrders: undefined,
        relativeDateSettings: undefined,
        liquidMMOrders: undefined,
        spotMMOrders: undefined,
        immMMOrders: undefined,
      },
      error: {
        liquidInstruments: [],
        singleMaturitySettings: [],
        ruleBasedOrders: [],
        relativeDateSettings: [],
        liquidMMOrders: [],
        spotMMOrders: [],
        immMMOrders: [],
      },
      code: 200,
    };
  }

  _parseLiquidInstruments(
    symbolToInstrumentMapper: Map<string, SessionInstrument>,
  ): MMWParserServiceI {
    const output = {
      data: { instrument_ids: [] },
      error: [],
    };
    try {
      const liquidInstrumentSymbols = this.mmwJsonObj.LiquidRows.map(
        (liquidRow) => liquidRow.active && liquidRow.refID,
      );
      liquidInstrumentSymbols.forEach((symbol) => {
        const instrument = symbolToInstrumentMapper.get(symbol);
        if (instrument) {
          output.data.instrument_ids.push(instrument.instrument_id);
        } else {
          output.error.push(symbol);
        }
      });
      return output;
    } catch (err) {
      output.error.push[err];
      return output;
    }
  }
  _parseSingleMaturitySettings(): MMWParserServiceI {
    const output = {
      data: { order_type_ids: [] },
      error: [],
    };
    try {
      if (this.mmwJsonObj.Limits.SMLimit)
        output.data.order_type_ids.push(OrderTypeIdE.MM);
      return output;
    } catch (err) {
      output.error.push[err];
      return output;
    }
  }

  _parserRuleBasedOrders(
    symbolToInstrumentMapper: Map<string, SessionInstrument>,
  ): MMWParserServiceI {
    const output = {
      data: {},
      error: [],
    };
    try {
      if (this.mmwJsonObj.OrderTypeState.pairFly) {
        const ruleBasedPairFlies = this.mmwJsonObj.PairsFlies;
        const minDate = dateFromYearInstrument(
          this.sessionDate,
          ruleBasedPairFlies.autoQuoteRange[0],
          symbolToInstrumentMapper,
        );
        const maxDate = dateFromYearInstrument(
          this.sessionDate,
          ruleBasedPairFlies.autoQuoteRange[1],
          symbolToInstrumentMapper,
        );
        const [minInstrument, max_instrument] = innerRangeEndInstruments(
          minDate,
          maxDate,
          this.sessionInstruments,
        );
        const instrumentSubtypeIds = [];
        if (ruleBasedPairFlies.tenors.Spot) instrumentSubtypeIds.push(1);
        if (ruleBasedPairFlies.tenors.IMM) instrumentSubtypeIds.push(2);
        output.data[SubOrderTypeIdE.RB_SPREAD] = {
          instrument_subtype_ids: instrumentSubtypeIds,
          liquid_instruments: ruleBasedPairFlies.tenors.Liquid,
          instrument_id_min: minInstrument.instrument_id,
          instrument_id_max: max_instrument.instrument_id,
          fraction_of_spread: ruleBasedPairFlies.pairs / 100,
        };
        output.data[SubOrderTypeIdE.RB_FLY] = {
          instrument_subtype_ids: instrumentSubtypeIds,
          liquid_instruments: ruleBasedPairFlies.tenors.Liquid,
          instrument_id_min: minInstrument.instrument_id,
          instrument_id_max: max_instrument.instrument_id,
          fraction_of_spread: ruleBasedPairFlies.flies / 100,
        };
      }
      if (this.mmwJsonObj.OrderTypeState.fss) {
        const ruleBasedFSS = this.mmwJsonObj.FSS;
        const minDate = dateFromYearInstrument(
          this.sessionDate,
          ruleBasedFSS.autoQuoteRange[0],
          symbolToInstrumentMapper,
        );
        const maxDate = dateFromYearInstrument(
          this.sessionDate,
          ruleBasedFSS.autoQuoteRange[1],
          symbolToInstrumentMapper,
        );
        const [minInstrument, max_instrument] = innerRangeEndInstruments(
          minDate,
          maxDate,
          this.sessionInstruments,
        );
        output.data[SubOrderTypeIdE.RB_FWD] = {
          instrument_subtype_ids: [1, 2],
          liquid_instruments: ruleBasedFSS.tenors.Liquid,
          instrument_id_min: minInstrument.instrument_id,
          instrument_id_max: max_instrument.instrument_id,
          fraction_of_spread: ruleBasedFSS.fss / 100,
        };
      }
      return output;
    } catch (err) {
      output.error.push[err];
      return output;
    }
  }

  _parseRelativeDateSettings(): MMWParserServiceI {
    const output = {
      data: undefined,
      error: [],
    };

    try {
      const noOfBuckets = this.mmwJsonObj.Limits.bucketLimit;
      const settingObj = this.defaultRelativeDateSettings[String(noOfBuckets)];
      if (settingObj) {
        output.data = settingObj;
      }
      return output;
    } catch (err) {
      output.error.push[err];
      return output;
    }
  }

  _parseLiquidMMOrders(
    symbolToInstrumentMapper: Map<string, SessionInstrument>,
  ): MMWParserServiceI {
    const output = {
      data: [],
      error: [],
    };
    try {
      this.mmwJsonObj.LiquidRows.forEach((liquidRow) => {
        if (symbolToInstrumentMapper.get(liquidRow.refID)) {
          if (liquidRow.active) {
            const followOn =
              this.mmwJsonObj.OrderTypeState.followOn &&
              this.mmwJsonObj.FollowONTenors.Liquid
                ? {
                    notional: this.mmwJsonObj.FollowONOrders.liquidNotional,
                    spread: this.mmwJsonObj.FollowONOrders.liquidSpread,
                  }
                : null;
            const order = this._orderParserHelper(
              liquidRow,
              followOn,
              getSymbolToInstrumentMapper(this.sessionInstruments),
            );
            output.data.push(order);
          }
        } else {
          output.error.push(liquidRow.refID);
        }
      });
      return output;
    } catch (err) {
      output.error.push[err];
      return output;
    }
  }

  _parseOtherSpotMMOrders(
    symbolToInstrumentMapper: Map<string, SessionInstrument>,
  ): MMWParserServiceI {
    const output = {
      data: [],
      error: [],
    };
    try {
      this.mmwJsonObj.SpotRows.forEach((spotRow) => {
        if (symbolToInstrumentMapper.get(spotRow.refID)) {
          if (spotRow.active) {
            const followOn =
              this.mmwJsonObj.OrderTypeState.followOn &&
              this.mmwJsonObj.FollowONTenors.Spot
                ? {
                    notional: this.mmwJsonObj.FollowONOrders.spotNotional,
                    spread: this.mmwJsonObj.FollowONOrders.spotSpread,
                  }
                : null;
            const order = this._orderParserHelper(
              spotRow,
              followOn,
              getSymbolToInstrumentMapper(this.sessionInstruments),
            );
            output.data.push(order);
          }
        } else {
          output.error.push(spotRow.refID);
        }
      });
      return output;
    } catch (err) {
      output.error.push[err];
      return output;
    }
  }

  _parseIMMOrders(
    liquidMMOrders: SingleMaturityMMOrderMembers[],
    spotMMOrders: SingleMaturityMMOrderMembers[],
    sessionInstruments: SessionInstrument[],
    symbolToInstrumentMapper: Map<string, SessionInstrument>,
  ): MMWParserServiceI {
    const output = {
      data: [],
      error: [],
    };
    try {
      const immQuote = this.mmwJsonObj.IMMDates;
      const followOn =
        this.mmwJsonObj.OrderTypeState.followOn &&
        this.mmwJsonObj.FollowONTenors.IMM
          ? {
              notional: this.mmwJsonObj.FollowONOrders.immNotional,
              spread: this.mmwJsonObj.FollowONOrders.immSpread,
            }
          : null;
      const liquidSpotMapper = new Map(
        liquidMMOrders
          .concat(spotMMOrders)
          .map((order) => [order.instrument_id1, order]),
      );
      const minDate = dateFromYearInstrument(
        this.sessionDate,
        this.mmwJsonObj.IMMRange.autoQuoteRange[0],
        symbolToInstrumentMapper,
      );
      const maxDate = dateFromYearInstrument(
        this.sessionDate,
        this.mmwJsonObj.IMMRange.autoQuoteRange[1],
        symbolToInstrumentMapper,
      );
      const validIMMInstruments = innerRangeInstruments(
        minDate,
        maxDate,
        sessionInstruments.filter(
          (instrument) => instrument.instrument_subtype_id === 2,
        ),
      );

      const spotInstruments = outerRangeInstruments(
        new Date(validIMMInstruments[0].instrument_members.maturityDate),
        new Date(
          validIMMInstruments[
            validIMMInstruments.length - 1
          ].instrument_members.maturityDate,
        ),
        sessionInstruments.filter(
          (instrument) =>
            instrument.instrument_subtype_id === 1 &&
            liquidSpotMapper.has(instrument.instrument_id),
        ),
      );

      if (spotInstruments.length === 0 || validIMMInstruments.length === 0) {
        return output;
      }

      let spotArrayIndex = 0;
      let lowInstrument, highInstrument;

      const spotInstrumentDate = new Date(
        spotInstruments[spotArrayIndex].instrument_members.maturityDate,
      );
      if (
        spotInstrumentDate <
        new Date(validIMMInstruments[0].instrument_members.maturityDate)
      ) {
        lowInstrument = spotInstruments[spotArrayIndex];
        highInstrument = spotInstruments[spotArrayIndex + 1];
      } else {
        lowInstrument = undefined;
        highInstrument = spotInstruments[spotArrayIndex];
        spotArrayIndex++;
      }

      validIMMInstruments.forEach((immInstrument) => {
        const immDate = new Date(immInstrument.instrument_members.maturityDate);
        let highDate =
          highInstrument &&
          new Date(highInstrument.instrument_members.maturityDate);
        let lowDate =
          lowInstrument &&
          new Date(lowInstrument.instrument_members.maturityDate);
        while (highDate && immDate > highDate) {
          spotArrayIndex++;
          lowInstrument = highInstrument;
          lowDate = highDate;
          highInstrument = spotInstruments[spotArrayIndex + 1];
          highDate =
            highInstrument &&
            new Date(highInstrument.instrument_members.maturityDate);
        }

        if (
          !lowDate ||
          (highDate && +highDate - +immDate < +immDate - +lowDate)
        ) {
          output.data.push(
            this._createIMMOrder(
              immInstrument.instrument_id,
              liquidSpotMapper.get(highInstrument.instrument_id),
              immQuote,
              followOn,
            ),
          );
        } else {
          output.data.push(
            this._createIMMOrder(
              immInstrument.instrument_id,
              liquidSpotMapper.get(lowInstrument.instrument_id),
              immQuote,
              followOn,
            ),
          );
        }
      });
      return output;
    } catch (err) {
      output.error.push(err);
      return output;
    }
  }

  mainParser(): MMWParserOutputI {
    const symbolToInstrumentMapper = getSymbolToInstrumentMapper(
      this.sessionInstruments,
    );

    const liquidInstrumentsOutput = this._parseLiquidInstruments(
      symbolToInstrumentMapper,
    );
    this._outputUpdateHelper('liquidInstruments', liquidInstrumentsOutput);

    if (this.mmwJsonObj.Limits.SMLimit) {
      const singleMaturitySettingsOutput = this._parseSingleMaturitySettings();
      this._outputUpdateHelper(
        'singleMaturitySettings',
        singleMaturitySettingsOutput,
      );
    }

    if (this.mmwJsonObj.OrderTypeState.pairFly) {
      const ruleBasedOrdersOutput = this._parserRuleBasedOrders(
        symbolToInstrumentMapper,
      );
      this._outputUpdateHelper('ruleBasedOrders', ruleBasedOrdersOutput);
    }

    const relativeDateSettingsOutput = this._parseRelativeDateSettings();
    this._outputUpdateHelper(
      'relativeDateSettings',
      relativeDateSettingsOutput,
    );

    const liquidMMOrdersOutput = this._parseLiquidMMOrders(
      symbolToInstrumentMapper,
    );
    this._outputUpdateHelper('liquidMMOrders', liquidMMOrdersOutput);

    const spotMMOrdersOutput = this._parseOtherSpotMMOrders(
      symbolToInstrumentMapper,
    );
    this._outputUpdateHelper('spotMMOrders', spotMMOrdersOutput);

    if (this.mmwJsonObj.OrderTypeState.pairFly) {
      const immMMOrdersOutput = this._parseIMMOrders(
        liquidMMOrdersOutput.data,
        spotMMOrdersOutput.data,
        this.sessionInstruments,
        symbolToInstrumentMapper,
      );
      this._outputUpdateHelper('immMMOrders', immMMOrdersOutput);
    }
    return this.mmwParserOutput;
  }

  _outputUpdateHelper(key: string, serviceOutput: MMWParserServiceI) {
    this.mmwParserOutput.data[key] = serviceOutput.data;
    this.mmwParserOutput.error[key] = serviceOutput.error;
    if (serviceOutput.error.length > 0) this.mmwParserOutput.code = 400;
  }

  _orderParserHelper(
    orderRow: QuoteRow,
    followOn: FollowOnQuote,
    symbolToInstrumentMapper: Map<string, SessionInstrument>,
  ): SingleMaturityMMOrderMembers {
    const output = {
      instrument_id1: symbolToInstrumentMapper.get(orderRow.refID)
        .instrument_id,
      pay_amount: orderRow.pay * NOTIONAL_MULTIPLIER,
      receive_amount: orderRow.receive * NOTIONAL_MULTIPLIER,
      pay_price: -orderRow.wide,
      receive_price: orderRow.wide,
      ...(followOn && {
        fo_pay_amount:
          (followOn.notional / 100) * orderRow.pay * NOTIONAL_MULTIPLIER,
      }),
      ...(followOn && {
        fo_receive_amount:
          (followOn.notional / 100) * orderRow.receive * NOTIONAL_MULTIPLIER,
      }),
      ...(followOn && { fo_pay_price: -followOn.spread - orderRow.wide }),
      ...(followOn && { fo_receive_price: followOn.spread + orderRow.wide }),
      amount_type: AmountType.DV01,
      price_type: PriceType.SPREAD_TO_MID,
    };

    return output;
  }

  _createIMMOrder(
    instrument_id: number,
    spotOrder: SingleMaturityMMOrderMembers,
    immQuote: AutoQuote,
    followOn: FollowOnQuote,
  ): SingleMaturityMMOrderMembers {
    return {
      instrument_id1: instrument_id,
      pay_amount: spotOrder.pay_amount * (immQuote.deep / 100),
      receive_amount: spotOrder.receive_amount * (immQuote.deep / 100),
      pay_price: -immQuote.wide,
      receive_price: immQuote.wide,
      ...(followOn && {
        fo_pay_amount:
          (followOn.notional / 100) *
          spotOrder.pay_amount *
          (immQuote.deep / 100),
      }),
      ...(followOn && {
        fo_receive_amount:
          (followOn.notional / 100) *
          spotOrder.receive_amount *
          (immQuote.deep / 100),
      }),
      ...(followOn && { fo_pay_price: -followOn.spread - immQuote.wide }),
      ...(followOn && { fo_receive_price: followOn.spread + immQuote.wide }),
      amount_type: AmountType.DV01,
      price_type: PriceType.SPREAD_TO_MID,
    };
  }
}

export class SampleDataFormatter {
  private readonly symbolToInstrumentMapper: Map<string, SessionInstrument>;

  constructor(private readonly sessionInstruments: SessionInstrument[]) {
    this.symbolToInstrumentMapper =
      getSymbolToInstrumentMapper(sessionInstruments);
  }

  directionalOrdersParser(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    inputOrder: any[],
  ): SessionMultiOrder[] {
    const output = inputOrder.reduce((result, order) => {
      let missingInstrument = false;
      for (const id of [1, 2, 3]) {
        if (order.order_members.hasOwnProperty(`instrument_symbol${id}`)) {
          const instrument_id = this.symbolToInstrumentMapper.get(
            order.order_members[`instrument_symbol${id}`],
          )?.instrument_id;
          if (!instrument_id) {
            missingInstrument = true;
            break;
          }
          delete order.order_members[`instrument_symbol${id}`];
          order.order_members[`instrument_id${id}`] = instrument_id;
        } else {
          break;
        }
      }
      if (!missingInstrument) {
        const outputOrder: SessionMultiOrder = {
          session_id: sessionId,
          book_id: bookId,
          trader_id: traderId,
          order_subtype_id: order.order_subtype_id,
          order_key: null,
          order_members: order.order_members,
          custom_members: {},
          updated_by: userId,
        };
        result.push(outputOrder);
      }
      return result;
    }, []);
    return output;
  }

  deltaLadderOrderMembersParser(): any {
    return {};
  }

  deltaLadderDetailParser(
    orderId: number,
    sessionId: number,
    userId: number,
    inputOrderDetails: any[],
  ): any[] {
    const output = inputOrderDetails.reduce((result, detail) => {
      const instrument_id = this.symbolToInstrumentMapper.get(
        detail.instrument_symbol,
      )?.instrument_id;
      if (instrument_id) {
        const outputOrderDetails = {
          order_id: orderId,
          session_id: sessionId,
          instrument_id,
          order_detail_members: detail.order_detail_members,
          custom_members: {},
          updated_by: userId,
        };
        result.push(outputOrderDetails);
        return result;
      } else {
        return result;
      }
    }, []);
    return output;
  }

  curvesParser(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    inputCurveMembers: any[],
  ): any[] {
    const output = inputCurveMembers.reduce((result, curve) => {
      const instrument_id = this.symbolToInstrumentMapper.get(
        curve.instrument_symbol,
      )?.instrument_id;
      if (instrument_id) {
        instrument_id;
        const outputCurve = {
          session_id: sessionId,
          book_id: bookId,
          trader_id: traderId,
          instrument_id,
          curve_members: curve.curve_members,
          custom_members: {},
          updated_by: userId,
        };
        result.push(outputCurve);
        return result;
      } else {
        return result;
      }
    }, []);
    return output;
  }
}
