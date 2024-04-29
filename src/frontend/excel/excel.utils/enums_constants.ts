export enum SheetNameE {
  CURVES = 'Curves',
  DELTA_LADDER = 'Delta Ladder',
  SINGLE_MATURITY = 'Single Maturity Limits',
  DATE_RANGE = 'Date Range Limits',
  MARKET_MAKING = 'Market Making',
}

export enum MetaDataFieldsE {
  SESSION = 'sessionName',
  BOOK = 'bookName',
  TRADER = 'traderEmail',
}

export interface RawFeTableSettingsI {
  sessionSettings: any[];
  bookSettings: any[];
  bookUserSettings: any[];
}

export interface HeaderI {
  header: string;
  key: string;
  width: number;
}

export interface DataValueI {
  name: string;
  value: string;
}

export interface MetaDataI {
  [MetaDataFieldsE.SESSION]: DataValueI;
  [MetaDataFieldsE.BOOK]: DataValueI;
  [MetaDataFieldsE.TRADER]: DataValueI;
}


export const LIQUID_MATURITY_SYMBOL = 'Y';