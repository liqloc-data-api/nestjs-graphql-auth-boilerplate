import {
  MultiSessionOrderDetail,
  SessionInstrument,
} from 'frontend/graphql.schema';
import { HeaderI } from '../enums_constants';
import { headerFromColumnSettings } from '../excel.common.utils';
import {
  DeltaLadderTemplateDataI,
  toDbDeltaLadderFormat,
} from '../excel.transformation.utils/deltaLadder.transformation.utils';
import { ExcelRead } from './common.read.utils';

export class DeltaLadderExcelReader {
  private fileData: string;
  private headers: HeaderI[];
  private sheetName: string;
  rawData: DeltaLadderTemplateDataI[];

  constructor(fileData: string, columnSettings: any, sheetName: string) {
    this.fileData = fileData;
    this.headers = headerFromColumnSettings(columnSettings);
    this.sheetName = sheetName;
  }

  async getExcelDeltaLadderData(): Promise<void> {
    const excelReaderObj = new ExcelRead(this.headers, this.sheetName);
    this.rawData = await excelReaderObj.getData(this.fileData);
  }

  async getMultiDeltaLadderData(
    sessionId: number,
    orderId: number,
    userId: number,
    instrumentMap: Map<string, SessionInstrument>,
  ): Promise<MultiSessionOrderDetail[]> {
    await this.getExcelDeltaLadderData();
    const formattedData: MultiSessionOrderDetail[] = toDbDeltaLadderFormat(
      sessionId,
      orderId,
      this.rawData,
      instrumentMap,
      userId,
    );
    return formattedData;
  }
}
