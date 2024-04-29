import { SessionInstrument } from 'graphql.schema';
import { HeaderI } from '../enums_constants';
import { headerFromColumnSettings } from '../excel.common.utils';
import {
  SingleMaturityTemplateDataI,
  toDBSingleMaturityFormat,
} from '../excel.transformation.utils/singleMaturity.transformation.utils';
import { ExcelRead } from './common.read.utils';
import { MultiSessionSingleMaturityLimit } from 'frontend/graphql.schema';

export class SingleMaturityExcelReader {
  private fileData: string;
  private headers: HeaderI[];
  private sheetName: string;
  rawData: SingleMaturityTemplateDataI[];

  constructor(fileData: string, columnSettings: any, sheetName: string) {
    this.fileData = fileData;
    this.headers = headerFromColumnSettings(columnSettings);
    this.sheetName = sheetName;
  }

  async getExcelSingleMaturityData(): Promise<void> {
    const excelReaderObj = new ExcelRead(this.headers, this.sheetName);
    this.rawData = await excelReaderObj.getData(this.fileData);
  }

  async getMultiSingleMaturityData(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    instrumentMap: Map<string, SessionInstrument>,
  ): Promise<MultiSessionSingleMaturityLimit[]> {
    await this.getExcelSingleMaturityData();
    const formattedData: MultiSessionSingleMaturityLimit[] =
      toDBSingleMaturityFormat(
        sessionId,
        bookId,
        traderId,
        this.rawData,
        instrumentMap,
        userId,
      );
    return formattedData;
  }
}
