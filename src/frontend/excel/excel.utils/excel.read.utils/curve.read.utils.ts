import {
  MultiCurveIdMembers,
  MultiSessionCurveInput,
  SessionInstrument,
} from 'frontend/graphql.schema';
import { ExcelRead } from './common.read.utils';
import { HeaderI } from '../enums_constants';
import {
  CurveTemplateDataI,
  toDbCurveFormat,
} from '../excel.transformation.utils/curve.transformation.utils';
import { headerFromColumnSettings } from '../excel.common.utils';
import { get } from 'http';

export class CurveExcelReader {
  private fileData: string;
  private headers: HeaderI[];
  private sheetName: string;
  rawData: CurveTemplateDataI[];

  constructor(fileData: string, columnSettings: any, sheetName: string) {
    this.fileData = fileData;
    this.headers = headerFromColumnSettings(columnSettings);
    this.sheetName = sheetName;
  }

  async getExcelCurveData(): Promise<void> {
    const excelReaderObj = new ExcelRead(this.headers, this.sheetName);
    this.rawData = await excelReaderObj.getData(this.fileData);
  }

  async getMultiCurveData(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    instrumentMap: Map<string, SessionInstrument>,
  ): Promise<MultiSessionCurveInput[]> {
    await this.getExcelCurveData();
    const formattedData: MultiSessionCurveInput[] = toDbCurveFormat(
      sessionId,
      bookId,
      traderId,
      userId,
      this.rawData,
      instrumentMap,
    );
    return formattedData;
  }
}
