import { SessionInstrument } from 'frontend/graphql.schema';

export function getSymbolToInstrumentMapper(
  sessionInstruments: SessionInstrument[],
): Map<string, SessionInstrument> {
  const mapper = new Map<string, SessionInstrument>();
  sessionInstruments.forEach((sessionInstrument) => {
    mapper.set(sessionInstrument.symbol, sessionInstrument);
  });
  return mapper;
}

export function getIdToInstrumentMapper(
  sessionInstruments: SessionInstrument[],
): Map<number, SessionInstrument> {
  const mapper = new Map<number, SessionInstrument>();
  sessionInstruments.forEach((sessionInstrument) => {
    mapper.set(sessionInstrument.instrument_id, sessionInstrument);
  });
  return mapper;
}

export function justGreaterEqualMaturityThanDate(
  date: Date,
  sessionInstruments: SessionInstrument[],
): SessionInstrument {
  return sessionInstruments.find((sessionInstrument) => {
    return new Date(sessionInstrument.instrument_members.maturityDate) >= date;
  });
}

export function justLessEqualMaturityThanDate(
  date: Date,
  sessionInstruments: SessionInstrument[],
): SessionInstrument {
  return sessionInstruments
    .slice()
    .reverse()
    .find((sessionInstrument) => {
      return (
        new Date(sessionInstrument.instrument_members.maturityDate) <= date
      );
    });
}

export function addYearsToDate(baseDate: Date, noOfYears: number): Date {
  return new Date(
    baseDate.getFullYear() + noOfYears,
    baseDate.getMonth(),
    baseDate.getDate(),
  );
}

export function dateFromYearInstrument(
  baseDate: Date,
  noOfYears: number,
  symbolToInstrumentMapper: Map<string, SessionInstrument>,
): Date {
  const instrument = symbolToInstrumentMapper.get(`${noOfYears}Y`);
  if (instrument) {
    return new Date(instrument.instrument_members.maturityDate);
  }

  return addYearsToDate(baseDate, noOfYears);
}

export function innerRangeEndInstruments(
  minDate: Date,
  maxDate: Date,
  sessionInstruments: SessionInstrument[],
): SessionInstrument[] {
  const minInstrument = sessionInstruments.find((sessionInstrument) => {
    return (
      new Date(sessionInstrument.instrument_members.maturityDate) >= minDate &&
      new Date(sessionInstrument.instrument_members.maturityDate) < maxDate
    );
  });
  const maxInstrument = sessionInstruments
    .slice()
    .reverse()
    .find((sessionInstrument) => {
      return (
        new Date(sessionInstrument.instrument_members.maturityDate) <=
          maxDate &&
        new Date(sessionInstrument.instrument_members.maturityDate) > minDate
      );
    });
  return [minInstrument, maxInstrument];
}

export function outerRangeEndInstruments(
  minDate: Date,
  maxDate: Date,
  sessionInstruments: SessionInstrument[],
): SessionInstrument[] {
  let minInstrument = sessionInstruments
    .slice()
    .reverse()
    .find((sessionInstrument) => {
      return (
        new Date(sessionInstrument.instrument_members.maturityDate) <= minDate
      );
    });
  if (!minInstrument) {
    minInstrument = sessionInstruments.find((sessionInstrument) => {
      return (
        new Date(sessionInstrument.instrument_members.maturityDate) >=
          minDate &&
        new Date(sessionInstrument.instrument_members.maturityDate) < maxDate
      );
    });
  }
  const maxInstrument = sessionInstruments.find((sessionInstrument) => {
    return (
      new Date(sessionInstrument.instrument_members.maturityDate) >= maxDate
    );
  });
  return [minInstrument, maxInstrument];
}

export function innerRangeInstruments(
  minDate: Date,
  maxDate: Date,
  sessionInstruments: SessionInstrument[],
): SessionInstrument[] {
  const minInstrument = sessionInstruments.findIndex((sessionInstrument) => {
    return (
      new Date(sessionInstrument.instrument_members.maturityDate) >= minDate &&
      new Date(sessionInstrument.instrument_members.maturityDate) <= maxDate
    );
  });
  const maxInstrument =
    sessionInstruments.length -
    1 -
    sessionInstruments
      .slice()
      .reverse()
      .findIndex((sessionInstrument) => {
        return (
          new Date(sessionInstrument.instrument_members.maturityDate) <=
            maxDate &&
          new Date(sessionInstrument.instrument_members.maturityDate) >= minDate
        );
      });
  if (minInstrument === -1 && maxInstrument === -1) return [];
  return sessionInstruments.slice(minInstrument, maxInstrument + 1);
}

export function outerRangeInstruments(
  minDate: Date,
  maxDate: Date,
  sessionInstruments: SessionInstrument[],
): SessionInstrument[] {
  let minInstrument =
    sessionInstruments.length -
    1 -
    sessionInstruments
      .slice()
      .reverse()
      .findIndex((sessionInstrument) => {
        return (
          new Date(sessionInstrument.instrument_members.maturityDate) <= minDate
        );
      });
  if (minInstrument === -1) {
    minInstrument = sessionInstruments.findIndex((sessionInstrument) => {
      return (
        new Date(sessionInstrument.instrument_members.maturityDate) >=
          minDate &&
        new Date(sessionInstrument.instrument_members.maturityDate) < maxDate
      );
    });
  }
  const maxInstrument = sessionInstruments.findIndex((sessionInstrument) => {
    return (
      new Date(sessionInstrument.instrument_members.maturityDate) >= maxDate
    );
  });
  if (minInstrument === -1 && maxInstrument === -1) return [];
  if (minInstrument === -1) return sessionInstruments.slice(0, maxInstrument);
  if (maxInstrument === -1) return sessionInstruments.slice(minInstrument);
  return sessionInstruments.slice(minInstrument, maxInstrument + 1);
}
