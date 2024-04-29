import { SessionMultiOrder } from 'graphql.schema';
import { HeaderI } from '../enums_constants';
import { headerFromColumnSettings } from '../excel.common.utils';
import { MarketMakingTemplateDataI, toDBmarketMakingFormat } from '../excel.transformation.utils/marketMaking.transformation.utils';
import { ExcelRead } from './common.read.utils';
import { SessionInstrument } from 'frontend/graphql.schema';

export class MarketMakingExcelReader {
  private fileData: string;
  private headers: HeaderI[];
  private sheetName: string;
  rawData: MarketMakingTemplateDataI[];

  constructor(fileData: string, columnSettings: any, sheetName: string) {
    this.fileData = fileData;
    this.headers = headerFromColumnSettings(columnSettings);
    this.sheetName = sheetName;
  }

  async getExcelMarketMakingData(): Promise<void> {
    const excelReaderObj = new ExcelRead(this.headers, this.sheetName);
    this.rawData = await excelReaderObj.getData(this.fileData);
  }

  async getMultiMarketMakingData(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    instrumentMap: Map<string, SessionInstrument>,
  ): Promise<SessionMultiOrder[]> {
    await this.getExcelMarketMakingData();
    const formattedData: SessionMultiOrder[] = 
      toDBmarketMakingFormat(
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
