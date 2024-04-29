import { ParameterSubTypeIdE } from 'frontend/parameters/enums_constants';

const getStartMat = (
  prev: string,
  date: string,
  instrumentFromMaturityMap: any,
  instrumentIndexMap: any,
  sessionMaturities: any[],
) => {
  if (prev && date) {
    const index = instrumentIndexMap[instrumentFromMaturityMap.get(prev)];

    return sessionMaturities[index + 1]?.maturity;
  }
  return sessionMaturities[0]?.maturity;
};

const getColumnLabel = (index: number) => {
  let dividend = index;
  let columnName = '';
  let modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    //convert the dividend to be integer
    dividend = parseInt(((dividend - modulo) / 26).toString(), 10);
  }
  return columnName;
};

const getBucketSum = (
  date: string,
  prev: string,
  key: string,
  impliedLimits: any[],
  instrumentFromMaturityMap: any,
  instrumentIndexMap: any,
  sessionMaturities: any[],
) => {
  //we got the prev endDate, we need to get Maturity next to prev endDate
  const prevDate = getStartMat(
    prev,
    date,
    instrumentFromMaturityMap,
    instrumentIndexMap,
    sessionMaturities,
  );
  //initialize sum
  let sum = 0;
  //get the index of the prevDate and date
  const startIndex =
    instrumentIndexMap[instrumentFromMaturityMap.get(prevDate)];
  //   const startIndex = SMData.findIndex((obj) => obj.maturity === prevDate);
  const endIndex = instrumentIndexMap[instrumentFromMaturityMap.get(date)];
  //   const endIndex = SMData.findIndex((obj) => obj.maturity === date);

  if (startIndex === -1 || endIndex === -1) return 0;
  //run a loop between the ranges to get the sum
  for (let i = startIndex; i <= endIndex; i++) {
    sum += Number(impliedLimits[i][key]);
  }

  return sum;
};

const getMin = (a, b) => {
  return a < b ? a : b;
};

const getLimitValue = (
  near: string,
  far: string,
  nearName: string,
  farName: string,
  savedLimitData: any,
  multiplier: number,
  impliedLimits: any[],
  prevNear: string,
  prevFar: string,
  instrumentFromMaturityMap: any,
  instrumentIndexMap: any,
  sessionMaturities: any[],
) => {
  const limitKey = `${nearName}-${farName}`;

  if (savedLimitData[limitKey]) {
    return {
      limitValue: savedLimitData?.[limitKey].limit,
      inferredValue: false,
    };
  }

  const flatSum = getBucketSum(
    far,
    prevFar,
    'max_pay_limit',
    impliedLimits,
    instrumentFromMaturityMap,
    instrumentIndexMap,
    sessionMaturities,
  );
  const steepSum = getBucketSum(
    near,
    prevNear,
    'max_receive_limit',
    impliedLimits,
    instrumentFromMaturityMap,
    instrumentIndexMap,
    sessionMaturities,
  );
  const limit = getMin(steepSum * multiplier, flatSum * multiplier);

  return {
    limitValue: limit,
    inferredValue: true,
  };
};

const getAllInstrumentsForBucket = (
  prevEndDate: string,
  endDate: string,
  instrumentFromMaturityMap: any,
  instrumentIndexMap: any,
  sessionMaturities: any[],
) => {
  const instruments = [];
  const prevDate = getStartMat(
    prevEndDate,
    endDate,
    instrumentFromMaturityMap,
    instrumentIndexMap,
    sessionMaturities,
  );
  const startIndex =
    instrumentIndexMap[instrumentFromMaturityMap.get(prevDate)];
  const endIndex = instrumentIndexMap[instrumentFromMaturityMap.get(endDate)];

  for (let i = startIndex; i <= endIndex; i++) {
    instruments.push(sessionMaturities[i].instrument_id);
  }

  return instruments;
};

const createRdrlValues = (
  impliedLimits: any[],
  savedLimitData: any,
  sessionMaturities: any[],
  endDates: any[],
  multiplier: number,
  instrumentIndexMap: any,
  instrumentFromMaturityMap: any,
) => {
  const cellData = [];
  const bucketData = [];
  //check if last endDate is the last instrument. if not add the last instrument to the endDates
  const lastInstrument = sessionMaturities[sessionMaturities.length - 1];
  if (lastInstrument.maturity !== endDates[endDates.length - 1]) {
    endDates.push(lastInstrument.maturity);
  }
  endDates.forEach((near, nIndex) => {
    const nearName = getColumnLabel(nIndex + 1);
    const prevNear = endDates[nIndex - 1];
    endDates.forEach((far, fIndex) => {
      //if diagonal, then skip
      if (nIndex === fIndex) return;
      const farName = getColumnLabel(fIndex + 1);
      const prevFar = endDates[fIndex - 1];
      const { limitValue, inferredValue } = getLimitValue(
        near,
        far,
        nearName,
        farName,
        savedLimitData,
        multiplier,
        impliedLimits,
        prevNear,
        prevFar,
        instrumentFromMaturityMap,
        instrumentIndexMap,
        sessionMaturities,
      );

      const cell = {
        near_bucket_name: nearName < farName ? nearName : farName,
        far_bucket_name: farName > nearName ? farName : nearName,
        limit: limitValue,
        direction: nIndex < fIndex ? 'Pay' : 'Receive',
        inferred: inferredValue,
      };
      cellData.push(cell);
    });
  });

  //create the bucketData
  endDates.forEach((endDate, index) => {
    const bucket = {
      name: getColumnLabel(index + 1),
      instrument_ids: getAllInstrumentsForBucket(
        endDates[index - 1],
        endDate,
        instrumentFromMaturityMap,
        instrumentIndexMap,
        sessionMaturities,
      ),
    };
    bucketData.push(bucket);
  });

  const returnData = {
    buckets: bucketData,
    bucket_pair_limits: cellData,
    unit: 'DV01',
  };

  return returnData;
};

export function getRdrlValues(
  impliedLimits: any[],
  savedLimits: any[],
  limitSettings: any,
  sessionInstruments: any[],
) {
  // Step 1: create a map of instrument_id to index
  const instrumentIndexMap = {};
  const instrumentFromMaturityMap = new Map<string, number>();
  const maturityFromInstrumentMap = new Map<number, string>();

  const sessionMaturities = sessionInstruments.map((data, index) => {
    instrumentIndexMap[data.instrument_id] = index;
    instrumentFromMaturityMap.set(data.symbol, data.instrument_id);
    maturityFromInstrumentMap.set(data.instrument_id, data.symbol);
    return {
      maturity: data.symbol,
      instrument_id: data.instrument_id,
      imm_date_flag: data.instrument_subtype_id === 2,
      maturity_date: data.instrument_members.maturityDate,
      number_of_periods: data.instrument_members.numberOfPeriods,
      session_id: data.session_id,
      spot_date_flag: data.instrument_subtype_id === 1,
    };
  });

  const RDLimits = savedLimits.find(
    (limit) => limit.parameter_subtype_id === ParameterSubTypeIdE.RD,
  );

  const RDLimitSettings = savedLimits.find(
    (limit) => limit.parameter_subtype_id === ParameterSubTypeIdE.RD_SETTING,
  );

  const endDatesInstruments =
    RDLimitSettings?.parameter_members?.bucket_end_instrument_ids ||
    limitSettings?.setting_members?.['10']?.bucket_end_instrument_ids;

  const endDates = endDatesInstruments?.map((item: number) =>
    maturityFromInstrumentMap.get(item),
  );

  const multiplier = RDLimitSettings?.parameter_members?.multiplier || 1;

  const savedLimitData = RDLimits?.parameter_members || {};

  const rdrlValues = createRdrlValues(
    impliedLimits,
    savedLimitData,
    sessionMaturities,
    endDates,
    multiplier,
    instrumentIndexMap,
    instrumentFromMaturityMap,
  );

  return rdrlValues;
}
