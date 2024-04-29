/**
 * Maturity Mapper Utils.
 * Function to generate lists of ids of directional orders,
 * single maturity limits and date range limits per session instrument.
 * @module business-parsers-utils/maturity-mapper
 */

import { AppLogger } from 'common/logger/logger.service';
import { ParameterSubTypeIdE } from 'frontend/parameters/enums_constants';

/**
 * Func to process order member and update the result object.
 * This works by iterating over the order member and updating the result object.
 * We iterate over the possible instruments within the orderMember and find the indices for min and max.
 * If only one of min or max is provided, the range is adjusted to include the instrumentId.
 * The instrumentIndexMap is used to find the indices of the min and max instruments.
 * The result object is updated for all instruments within the range.
 * @param orderId The order id
 * @param orderMember The order member
 * @param result The result object
 * @param sessionInstruments The session instruments
 * @param instrumentIndexMap The map of instrument_id to index
 */
function processOrderMember(
  orderId: number,
  orderMember: any,
  result: any,
  sessionInstruments: any[],
  instrumentIndexMap: any,
) {
  // Iterate over possible instruments within the orderMember
  for (let i = 1; i <= 3; i++) {
    const instrumentIdKey = `instrument_id${i}`;
    const instrumentId = orderMember[instrumentIdKey];

    // Initial checks for min and max, using instrumentId as fallback if either is missing
    const minKey = `${instrumentIdKey}_min`;
    const maxKey = `${instrumentIdKey}_max`;
    let min = orderMember[minKey];
    let max = orderMember[maxKey];

    // Use instrumentId as fallback for missing min or max
    if (!min && !max && instrumentId) {
      // If both min and max are missing, it's a direct addition without a range
      if (result[instrumentId]) {
        result[instrumentId].directional.push(orderId);
      }
      continue; // Skip to the next iteration
    }

    // Adjust min and max based on availability
    min = min || instrumentId;
    max = max || instrumentId;

    // Find indices for adjusted min and max
    const minIndex = instrumentIndexMap[min];
    const maxIndex = instrumentIndexMap[max];

    // Update the result object for all instruments within the found range
    if (minIndex !== -1 && maxIndex !== -1) {
      for (let idx = minIndex; idx <= maxIndex; idx++) {
        const id = sessionInstruments[idx].instrument_id;
        if (result[id]) {
          result[id].directional.push(orderId);
        }
      }
    }
  }
}

/**
 * Func to process order details and update the result object.
 * This works by iterating over the order details and updating the result object
 * @param orderId  The order id
 * @param orderDetails The order details
 * @param result The result object
 */
function processOrderDetails(
  orderId: number,
  orderDetails: any[],
  result: any,
  instrumentIndexMap: any,
  sessionInstruments: any[],
) {
  orderDetails.forEach((detail) => {
    const instrumentId = detail['instrument_id1'];

    const minKey = 'instrument_id1_min';
    const maxKey = 'instrument_id1_max';

    let min = detail[minKey];
    let max = detail[maxKey];

    // Use instrumentId as fallback for missing min or max
    if (!min && !max && instrumentId) {
      // If both min and max are missing, it's a direct addition without a range
      if (result[instrumentId]) {
        result[instrumentId].directional.push(orderId);
      }
      return; // Skip to the next iteration
    }

    // Adjust min and max based on availability
    min = min || instrumentId;
    max = max || instrumentId;

    // Find indices for adjusted min and max
    const minIndex = instrumentIndexMap[min];
    const maxIndex = instrumentIndexMap[max];

    // Update the result object for all instruments within the found range
    if (minIndex !== -1 && maxIndex !== -1) {
      for (let idx = minIndex; idx <= maxIndex; idx++) {
        const id = sessionInstruments[idx].instrument_id;
        if (result[id]) {
          result[id].directional.push(orderId);
        }
      }
    }
  });
}

/**
 * Func to process limits and update the result object.
 * This works by iterating over the limits and updating the result object
 * We check the limit type and subtype to determine the type of limit
 * For single limits, we update the result object for the instrument id directly
 * For date limits, we use a range. The range is determined by the min and max instrument ids
 * We use the instrumentIndexMap to find the indices of the min and max instruments and
 * update the result object for all instruments within the range
 * @param limits The limits array
 * @param result The result object
 * @param sessionInstruments The session instruments
 * @param instrumentIndexMap The map of instrument_id to index
 */
function processLimits(
  limits: any[],
  result: any,
  sessionInstruments: any[],
  instrumentIndexMap: any,
) {
  limits.forEach((limit) => {
    const {
      parameter_id,
      parameter_type_id,
      parameter_subtype_id,
      parameter_members,
    } = limit;

    // Process Single Limits
    if (parameter_subtype_id === ParameterSubTypeIdE.SM) {
      if (result[parameter_members.instrument_id]) {
        result[parameter_members.instrument_id].singleLimits.push(parameter_id);
      }
    }

    // Process Date Limits
    else if (parameter_subtype_id === ParameterSubTypeIdE.DR) {
      const minInstrumentIndex =
        instrumentIndexMap[parameter_members.instrument_id_min];
      const maxInstrumentIndex =
        instrumentIndexMap[parameter_members.instrument_id_max];

      // Ensure both indices are found
      if (minInstrumentIndex !== -1 && maxInstrumentIndex !== -1) {
        // Update the result object for all instruments within the range
        for (let i = minInstrumentIndex; i <= maxInstrumentIndex; i++) {
          const instrumentId = sessionInstruments[i].instrument_id;
          result[instrumentId].dateLimits.push(parameter_id);
        }
      }
    }
  });
}

/**
 * Func to parse the maturity mapper.
 * We initialize the result structure with empty arrays for directional, single and date limits
 * We then process limits and directional orders using the processLimits and processOrderMember functions
 * @param sessionInstruments The session instruments array
 * @param directionalOrders The directional orders array
 * @param limits The limits array contains single and date limits
 * @returns A result object containing lists of ids of directional orders, single maturity limits and date range limits per session instrument
 */
export const parseMaturityMapper = (
  sessionInstruments: any[],
  directionalOrders: any[],
  limits: any[],
) => {
  const result = {};
  const instrumentIndexMap = {};

  // Initialize result structure
  sessionInstruments.forEach((instrument, index) => {
    result[instrument.instrument_id] = {
      directional: [],
      singleLimits: [],
      dateLimits: [],
    };

    // Create a map of instrument_id to index
    instrumentIndexMap[instrument.instrument_id] = index;
  });

  // Process each limit
  processLimits(limits, result, sessionInstruments, instrumentIndexMap); //TODO: optimize this

  //Process each directional order
  directionalOrders.forEach((order) => {
    const { order_id, order_members } = order;

    if (order_members.order_details) {
      // Handle nested order_details
      processOrderDetails(
        order_id,
        order_members.order_details,
        result,
        instrumentIndexMap,
        sessionInstruments,
      );
    } else {
      // Handle regular order_members
      processOrderMember(
        order_id,
        order_members,
        result,
        sessionInstruments,
        instrumentIndexMap,
      ); //TODO: optimize this
    }
  });

  return result;
};
